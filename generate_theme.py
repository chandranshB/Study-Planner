
def hex_to_rgb(hex_color):
    hex_color = hex_color.lstrip('#')
    return tuple(int(hex_color[i:i+2], 16) for i in (0, 2, 4))

palettes = {
    'default': { # Blue
        '50': '#eff6ff', '100': '#dbeafe', '200': '#bfdbfe', '300': '#93c5fd',
        '400': '#60a5fa', '500': '#3b82f6', '600': '#2563eb', '700': '#1d4ed8',
        '800': '#1e40af', '900': '#1e3a8a', '950': '#172554'
    },
    'ocean': { # Sky
        '50': '#f0f9ff', '100': '#e0f2fe', '200': '#bae6fd', '300': '#7dd3fc',
        '400': '#38bdf8', '500': '#0ea5e9', '600': '#0284c7', '700': '#0369a1',
        '800': '#075985', '900': '#0c4a6e', '950': '#082f49'
    },
    'sunset': { # Rose
        '50': '#fff1f2', '100': '#ffe4e6', '200': '#fecdd3', '300': '#fda4af',
        '400': '#fb7185', '500': '#f43f5e', '600': '#e11d48', '700': '#be123c',
        '800': '#9f1239', '900': '#881337', '950': '#4c0519'
    },
    'dark': { # Blue (same as default for now, but could be tweaked)
        '50': '#eff6ff', '100': '#dbeafe', '200': '#bfdbfe', '300': '#93c5fd',
        '400': '#60a5fa', '500': '#3b82f6', '600': '#2563eb', '700': '#1d4ed8',
        '800': '#1e40af', '900': '#1e3a8a', '950': '#172554'
    }
}

# Generate CSS
print(":root {")
for shade, hex_val in palettes['default'].items():
    r, g, b = hex_to_rgb(hex_val)
    print(f"  --primary-{shade}: {r} {g} {b};")
print("}")

for theme in ['ocean', 'sunset', 'dark']:
    print(f".{theme} {{")
    for shade, hex_val in palettes[theme].items():
        r, g, b = hex_to_rgb(hex_val)
        print(f"  --primary-{shade}: {r} {g} {b};")
    print("}")

# Generate Tailwind Config part
print("\n// Tailwind Config Colors")
print("primary: {")
for shade in palettes['default'].keys():
    print(f"  {shade}: 'rgb(var(--primary-{shade}) / <alpha-value>)',")
print("},")
