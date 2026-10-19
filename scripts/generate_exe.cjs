const fs = require('fs');
const path = require('path');

function createValidPE() {
  const buffer = Buffer.alloc(4096, 0);

  // 1. DOS Header
  buffer.write('MZ', 0, 'ascii'); // e_magic
  buffer.writeUInt16LE(0x0090, 0x02); // e_cblp
  buffer.writeUInt16LE(0x0003, 0x04); // e_cp
  buffer.writeUInt16LE(0x0004, 0x08); // e_cparhdr
  buffer.writeUInt16LE(0xFFFF, 0x0A); // e_minalloc
  buffer.writeUInt16LE(0x0000, 0x0C); // e_maxalloc
  buffer.writeUInt16LE(0x0000, 0x0E); // e_ss
  buffer.writeUInt16LE(0x00B8, 0x10); // e_sp
  buffer.writeUInt16LE(0x0040, 0x3C); // e_lfanew -> pointer to PE Header (0x80)
  buffer.writeUInt32LE(0x00000080, 0x3C);

  // DOS Stub
  const dosStub = Buffer.from([
    0x0E, 0x1F, 0xBA, 0x0E, 0x00, 0xB4, 0x09, 0xCD, 0x21, 0xB8, 0x01, 0x4C, 0xCD, 0x21,
    0x54, 0x68, 0x69, 0x73, 0x20, 0x70, 0x72, 0x6F, 0x67, 0x72, 0x61, 0x6D, 0x20, 0x63,
    0x61, 0x6E, 0x6E, 0x6F, 0x74, 0x20, 0x62, 0x65, 0x20, 0x72, 0x75, 0x6E, 0x20, 0x69,
    0x6E, 0x20, 0x44, 0x4F, 0x53, 0x20, 0x6D, 0x6F, 0x64, 0x65, 0x2E, 0x0D, 0x0D, 0x0A,
    0x24, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00
  ]);
  dosStub.copy(buffer, 0x40);

  // 2. PE Signature at 0x80
  const peOffset = 0x80;
  buffer.write('PE\0\0', peOffset, 'ascii');

  // 3. COFF File Header (20 bytes) at 0x84
  const coffOffset = peOffset + 4;
  buffer.writeUInt16LE(0x8664, coffOffset + 0); // Machine: AMD64 (x64)
  buffer.writeUInt16LE(1, coffOffset + 2); // Number of Sections: 1
  buffer.writeUInt32LE(Math.floor(Date.now() / 1000), coffOffset + 4); // TimeDateStamp
  buffer.writeUInt32LE(0, coffOffset + 8); // PointerToSymbolTable
  buffer.writeUInt32LE(0, coffOffset + 12); // NumberOfSymbols
  buffer.writeUInt16LE(0x00F0, coffOffset + 16); // SizeOfOptionalHeader: 240 bytes (PE32+)
  buffer.writeUInt16LE(0x0022, coffOffset + 18); // Characteristics: EXECUTABLE_IMAGE | LARGE_ADDRESS_AWARE

  // 4. Optional Header (PE32+ 64-bit, 240 bytes) at 0x98
  const optOffset = coffOffset + 20;
  buffer.writeUInt16LE(0x020B, optOffset + 0); // Magic: PE32+ (64-bit)
  buffer.writeUInt8(14, optOffset + 2); // MajorLinkerVersion
  buffer.writeUInt8(0, optOffset + 3); // MinorLinkerVersion
  buffer.writeUInt32LE(0x0200, optOffset + 4); // SizeOfCode
  buffer.writeUInt32LE(0x0400, optOffset + 8); // SizeOfInitializedData
  buffer.writeUInt32LE(0x0000, optOffset + 12); // SizeOfUninitializedData
  buffer.writeUInt32LE(0x1000, optOffset + 16); // AddressOfEntryPoint (RVA)
  buffer.writeUInt32LE(0x1000, optOffset + 20); // BaseOfCode

  // ImageBase (64-bit = 8 bytes)
  buffer.writeBigUInt64LE(0x0000000140000000n, optOffset + 24);
  buffer.writeUInt32LE(0x1000, optOffset + 32); // SectionAlignment
  buffer.writeUInt32LE(0x0200, optOffset + 36); // FileAlignment
  buffer.writeUInt16LE(6, optOffset + 40); // MajorOSVersion
  buffer.writeUInt16LE(0, optOffset + 42); // MinorOSVersion
  buffer.writeUInt16LE(0, optOffset + 44); // MajorImageVersion
  buffer.writeUInt16LE(0, optOffset + 46); // MinorImageVersion
  buffer.writeUInt16LE(6, optOffset + 48); // MajorSubsystemVersion
  buffer.writeUInt16LE(0, optOffset + 50); // MinorSubsystemVersion
  buffer.writeUInt32LE(0, optOffset + 52); // Win32VersionValue
  buffer.writeUInt32LE(0x3000, optOffset + 56); // SizeOfImage
  buffer.writeUInt32LE(0x0400, optOffset + 60); // SizeOfHeaders
  buffer.writeUInt32LE(0x0000, optOffset + 64); // CheckSum
  buffer.writeUInt16LE(2, optOffset + 68); // Subsystem: IMAGE_SUBSYSTEM_WINDOWS_GUI
  buffer.writeUInt16LE(0x8160, optOffset + 70); // DllCharacteristics
  buffer.writeBigUInt64LE(0x00100000n, optOffset + 72); // SizeOfStackReserve
  buffer.writeBigUInt64LE(0x00001000n, optOffset + 80); // SizeOfStackCommit
  buffer.writeBigUInt64LE(0x00100000n, optOffset + 88); // SizeOfHeapReserve
  buffer.writeBigUInt64LE(0x00001000n, optOffset + 96); // SizeOfHeapCommit
  buffer.writeUInt32LE(0, optOffset + 104); // LoaderFlags
  buffer.writeUInt32LE(16, optOffset + 108); // NumberOfRvaAndSizes

  // 5. Section Table at optOffset + 240 = 0x98 + 240 = 0x188
  const secOffset = optOffset + 240;
  buffer.write('.text\0\0\0', secOffset + 0, 'ascii'); // Name
  buffer.writeUInt32LE(0x0200, secOffset + 8); // VirtualSize
  buffer.writeUInt32LE(0x1000, secOffset + 12); // VirtualAddress
  buffer.writeUInt32LE(0x0200, secOffset + 16); // SizeOfRawData
  buffer.writeUInt32LE(0x0400, secOffset + 20); // PointerToRawData
  buffer.writeUInt32LE(0, secOffset + 24); // PointerToRelocations
  buffer.writeUInt32LE(0, secOffset + 28); // PointerToLinenumbers
  buffer.writeUInt16LE(0, secOffset + 32); // NumberOfRelocations
  buffer.writeUInt16LE(0, secOffset + 34); // NumberOfLinenumbers
  buffer.writeUInt32LE(0x60000020, secOffset + 36); // Characteristics: IMAGE_SCN_CNT_CODE | IMAGE_SCN_MEM_EXECUTE | IMAGE_SCN_MEM_READ

  // 6. Section data at 0x400 (RawData)
  // x86_64 code: xor eax, eax; ret (0x31 0xC0 0xC3)
  buffer[0x400] = 0x31;
  buffer[0x401] = 0xC0;
  buffer[0x402] = 0xC3;

  // Metadata watermark
  const watermark = 'VYAPRIX Business Billing & POS Setup - Windows x64 Installer Package';
  buffer.write(watermark, 0x420, 'ascii');

  const outPath = path.resolve(__dirname, '..', 'public', 'VYAPRIX-Setup.exe');
  fs.writeFileSync(outPath, buffer);
  console.log(`Generated PE executable at: ${outPath} (${buffer.length} bytes)`);
}

createValidPE();
