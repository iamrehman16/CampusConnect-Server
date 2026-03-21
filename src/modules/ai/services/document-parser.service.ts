import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import aiConfig from '../config/ai.config';
import * as fs from 'fs/promises';
import * as os from 'os';
import * as path from 'path';
import FormData from 'form-data';
import { fetchBuffer, fetchJson } from '../commom/utils/http.utils';
import nodeFetch from 'node-fetch'

@Injectable()
export class DocumentParserService {
  private readonly logger = new Logger(DocumentParserService.name);
  private readonly LLAMA_PARSE_BASE_URL =
    'https://api.cloud.llamaindex.ai/api/v1/parsing';
  private readonly MAX_POLL_ATTEMPTS = 30;
  private readonly POLL_INTERVAL_MS = 3000;

  constructor(
    @Inject(aiConfig.KEY) private aiCfg: ConfigType<typeof aiConfig>,
  ) {}

  private async downloadToTemp(
    fileUrl: string,
    resourceId: string,
  ): Promise<string> {
    const buffer = await fetchBuffer(fileUrl);
    const extension = path.extname(new URL(fileUrl).pathname) || '.bin';
    const tempPath = path.join(
      os.tmpdir(),
      `campusconnect_${resourceId}${extension}`,
    );
    await fs.writeFile(tempPath, buffer);
    return tempPath;
  }

  private async uploadForParsing(
    tempPath: string,
    retries = 3,
  ): Promise<string> {
    const fileBuffer = await fs.readFile(tempPath);
    const filename = path.basename(tempPath);

    for (let attempt = 1; attempt <= retries; attempt++) {
      const formData = new FormData();
      formData.append('file', fileBuffer, { filename });
      formData.append('result_type', 'markdown');

      const response = await nodeFetch(`${this.LLAMA_PARSE_BASE_URL}/upload`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.aiCfg.llamaCloudApiKey}`,
          ...formData.getHeaders(),
        },
        body: formData, // no 'as any' needed with node-fetch
      });

      if (response.ok) {
        const data = (await response.json()) as { id: string };
        return data.id;
      }

      const error = await response.text();

      if (response.status !== 500 || attempt === retries) {
        throw new Error(
          `LlamaParse upload failed: ${response.status} — ${error}`,
        );
      }

      this.logger.warn(
        `LlamaParse upload attempt ${attempt}/${retries} failed with 500, retrying...`,
      );
      await new Promise((resolve) => setTimeout(resolve, 2000 * attempt));
    }

    throw new Error('LlamaParse upload failed after all retries');
  }
  private async pollForResult(jobId: string): Promise<string> {
    for (let attempt = 0; attempt < this.MAX_POLL_ATTEMPTS; attempt++) {
      const response = await fetch(
        `${this.LLAMA_PARSE_BASE_URL}/job/${jobId}/result/markdown`,
        {
          headers: { Authorization: `Bearer ${this.aiCfg.llamaCloudApiKey}` },
        },
      );

      if (response.ok) {
        const data = (await response.json()) as { markdown: string };
        return data.markdown;
      }

      if (response.status !== 404) {
        throw new Error(`LlamaParse polling failed: ${response.statusText}`);
      }

      this.logger.log(
        `Polling attempt ${attempt + 1}/${this.MAX_POLL_ATTEMPTS} for job: ${jobId}`,
      );
      await new Promise((resolve) =>
        setTimeout(resolve, this.POLL_INTERVAL_MS),
      );
    }

    throw new Error(
      `LlamaParse job timed out after ${this.MAX_POLL_ATTEMPTS} attempts`,
    );
  }

  async parse(fileUrl: string, resourceId: string): Promise<string> {
    let tempPath: string | null = null;

    try {
      tempPath = await this.downloadToTemp(fileUrl, resourceId);

      const jobId = await this.uploadForParsing(tempPath);
      this.logger.log(
        `LlamaParse job started: ${jobId} for resource: ${resourceId}`,
      );

      const markdown = await this.pollForResult(jobId);

      if (!markdown?.trim()) {
        this.logger.warn(`Empty parse result for resource: ${resourceId}`);
        return '';
      }

      this.logger.log(
        `Parsed resource: ${resourceId}, characters: ${markdown.length}`,
      );
      return markdown;
    } catch (err) {
      this.logger.error(
        `Failed to parse document for resource: ${resourceId}`,
        err,
      );
      throw err;
    } finally {
      if (tempPath) {
        await fs.unlink(tempPath).catch(() => null);
      }
    }
  }
}
