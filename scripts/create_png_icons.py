import zlib
import struct
import os

def create_png(width, height, color_rgba, output_path):
    # PNG Signature: 89 50 4E 47 0D 0A 1A 0A
    sig = b'\x89PNG\r\n\x1a\n'
    
    # IHDR Chunk
    # Width (4), Height (4), Bit depth (1), Color type (6=RGBA), Compression (0), Filter (0), Interlace (0)
    ihdr_data = struct.pack('>IIBBBBB', width, height, 8, 6, 0, 0, 0)
    ihdr_crc = zlib.crc32(b'IHDR' + ihdr_data) & 0xffffffff
    ihdr = struct.pack('>I', len(ihdr_data)) + b'IHDR' + ihdr_data + struct.pack('>I', ihdr_crc)
    
    # Raw Image Data (Filter byte 0 at start of each scanline)
    r, g, b, a = color_rgba
    line = b'\x00' + bytes([r, g, b, a] * width)
    raw_data = line * height
    
    # IDAT Chunk (zlib compressed)
    compressed_data = zlib.compress(raw_data)
    idat_crc = zlib.crc32(b'IDAT' + compressed_data) & 0xffffffff
    idat = struct.pack('>I', len(compressed_data)) + b'IDAT' + compressed_data + struct.pack('>I', idat_crc)
    
    # IEND Chunk
    iend_crc = zlib.crc32(b'IEND') & 0xffffffff
    iend = struct.pack('>I', 0) + b'IEND' + struct.pack('>I', iend_crc)
    
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    with open(output_path, 'wb') as f:
        f.write(sig + ihdr + idat + iend)
    print(f"Generated {output_path}")

if __name__ == '__main__':
    base_dir = r"C:\Users\HP\.gemini\antigravity\scratch\bac-tchad-2027\public\icons"
    # Teal color (13, 148, 136, 255)
    create_png(192, 192, (13, 148, 136, 255), os.path.join(base_dir, "icon-192x192.png"))
    create_png(512, 512, (13, 148, 136, 255), os.path.join(base_dir, "icon-512x512.png"))
    create_png(512, 512, (15, 118, 110, 255), os.path.join(base_dir, "icon-maskable-512x512.png"))
