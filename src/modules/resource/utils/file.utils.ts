import { FileType } from "../enums/file-type.enum";

 
 
 export function inferFileType(format?: string, originalName?: string): FileType {
    const ext = originalName?.split('.').pop()?.toLowerCase() || '';
    const normalized = format?.toLowerCase() || ext;

    if (['pdf'].includes(normalized)) return FileType.PDF;
    if (['doc', 'docx'].includes(normalized)) return FileType.DOC;
    if (['ppt', 'pptx'].includes(normalized)) return FileType.PPT;
    if (['zip'].includes(normalized)) return FileType.ZIP;
    if (
      ['png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp', 'tiff'].includes(normalized)
    )
      return FileType.IMAGE;

    return FileType.OTHER;
  }
