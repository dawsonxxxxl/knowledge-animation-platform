"""
Manim Code Generator
Converts scene data to Manim Python code
"""

import os
import uuid
from typing import Dict, List, Any

OUTPUT_DIR = os.path.join(os.path.dirname(__file__), 'output')
os.makedirs(OUTPUT_DIR, exist_ok=True)


def generate_manim_code(composition: Dict[str, Any]) -> str:
    """Generate Manim Python code from composition data"""

    scenes_code = []

    for scene in composition.get('scenes', []):
        scene_code = generate_scene_code(scene, composition)
        scenes_code.append(scene_code)

    # Generate full Python file
    full_code = f'''"""
Auto-generated animation by Knowledge Animation Platform
"""

from manim import *

# Configuration
config.pixel_height = {composition.get('height', 1080)}
config.pixel_width = {composition.get('width', 1920)}
config.frame_rate = {composition.get('fps', 30)}

{chr(10).join(scenes_code)}

if __name__ == "__main__":
    {chr(10).join([f"config.cli_style = \"--preview\"" for _ in scenes_code])}
'''

    return full_code


def generate_scene_code(scene: Dict[str, Any], composition: Dict[str, Any]) -> str:
    """Generate Manim code for a single scene"""

    elements_code = []

    for element in scene.get('elements', []):
        element_code = generate_element_code(element)
        if element_code:
            elements_code.append(element_code)

    bg_color = scene.get('backgroundColor', '#000000')

    return f'''class Scene{scene.get('order', 0)}(Scene):
    def construct(self):
        self.camera.background_color = "{bg_color}"

{chr(10).join(["        " + line for line in chr(10).join(elements_code).split(chr(10))])}
'''


def generate_element_code(element: Dict[str, Any]) -> str:
    """Generate Manim code for a single element"""

    elem_type = element.get('type', '')
    props = element.get('properties', {})
    name = element.get('name', 'element')

    if elem_type == 'text':
        return generate_text_element(props, name)
    elif elem_type == 'equation':
        return generate_equation_element(props, name)
    elif elem_type == 'shape':
        return generate_shape_element(props, name)
    elif elem_type == 'chart':
        return generate_chart_element(props, name)
    elif elem_type == 'image':
        return generate_image_element(props, name)

    return f'# Unknown element type: {elem_type}'


def generate_text_element(props: Dict, name: str) -> str:
    """Generate Text element code"""
    text = props.get('text', '')
    font_size = props.get('fontSize', 24)
    color = props.get('color', '#FFFFFF')
    x = props.get('x', 0)
    y = props.get('y', 0)

    # Escape quotes
    text = text.replace('"', '\\"').replace("'", "\\'")

    return f'''{name} = Text("{text}", font_size={font_size}, color="{color}")
        self.add({name})
        {name}.move_to(RIGHT * {x/1000 - 1} + UP * ({1 - y/1000}))'''


def generate_equation_element(props: Dict, name: str) -> str:
    """Generate MathTex/equation element code"""
    latex = props.get('latex', '')
    scale = props.get('scale', 1)
    x = props.get('x', 0)
    y = props.get('y', 0)

    # Escape backslashes
    latex = latex.replace('\\', '\\\\').replace('"', '\\"')

    return f'''{name} = MathTex(r"{latex}", scale={scale})
        self.add({name})
        {name}.move_to(RIGHT * {x/1000 - 1} + UP * ({1 - y/1000}))'''


def generate_shape_element(props: Dict, name: str) -> str:
    """Generate shape element code"""
    shape_type = props.get('shapeType', 'rectangle')
    width = props.get('width', 100) / 100
    height = props.get('height', 100) / 100
    fill = props.get('fill', '#FFFFFF')
    stroke = props.get('stroke', '#FFFFFF')
    stroke_width = props.get('strokeWidth', 2)
    x = props.get('x', 0)
    y = props.get('y', 0)

    if shape_type == 'circle':
        return f'''{name} = Circle(radius={width/2}, fill_opacity=0.5, color="{fill}", stroke_color="{stroke}", stroke_width={stroke_width})
        self.add({name})
        {name}.move_to(RIGHT * {x/1000 - 1} + UP * ({1 - y/1000}))'''
    elif shape_type == 'line':
        return f'''{name} = Line(LEFT * {width/2}, RIGHT * {width/2}, stroke_width={stroke_width})
        self.add({name})
        {name}.move_to(RIGHT * {x/1000 - 1} + UP * ({1 - y/1000}))'''
    elif shape_type == 'arrow':
        return f'''{name} = Arrow(LEFT * {width/2}, RIGHT * {width/2}, buff=0, stroke_width={stroke_width})
        self.add({name})
        {name}.move_to(RIGHT * {x/1000 - 1} + UP * ({1 - y/1000}))'''
    else:  # rectangle
        return f'''{name} = Rectangle(width={width}, height={height}, fill_opacity=0.5, color="{fill}", stroke_color="{stroke}", stroke_width={stroke_width})
        self.add({name})
        {name}.move_to(RIGHT * {x/1000 - 1} + UP * ({1 - y/1000}))'''


def generate_chart_element(props: Dict, name: str) -> str:
    """Generate chart element code"""
    chart_type = props.get('chartType', 'bar')
    data = props.get('data', [])

    # Generate simple bar chart using rectangles
    bars = []
    for i, item in enumerate(data):
        label = item.get('label', '')
        value = item.get('value', 0)
        bar_height = value / 10
        bars.append(f'''        bar_{i} = Rectangle(width=0.3, height={bar_height}, fill_opacity=0.7, color=BLUE)
        bar_{i}.move_to(DOWN * ({bar_height/2 - 0.5}) + RIGHT * ({i * 0.5 - 1}))
        self.add(bar_{i})''')

    return f'''# Bar chart
{chr(10).join(bars)}'''


def generate_image_element(props: Dict, name: str) -> str:
    """Generate image element code"""
    src = props.get('src', '')
    width = props.get('width', 100) / 100
    height = props.get('height', 100) / 100
    x = props.get('x', 0)
    y = props.get('y', 0)

    # Note: In production, would download and embed image
    return f'''# Image from {src}
# {name} = ImageMobject("{src}").scale_to_fit_width({width})
# self.add({name})'''


def save_manim_script(code: str) -> str:
    """Save the generated code to a file and return the path"""
    filename = f"animation_{uuid.uuid4().hex[:8]}.py"
    filepath = os.path.join(OUTPUT_DIR, filename)
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(code)
    return filepath


def render_video(script_path: str, quality: str = 'medium_quality') -> Dict[str, Any]:
    """Render the Manim animation and return job status"""
    import subprocess

    job_id = f"render_{uuid.uuid4().hex[:8]}"

    # Run manim render
    output_path = os.path.join(OUTPUT_DIR, job_id)
    os.makedirs(output_path, exist_ok=True)

    cmd = [
        'manim', '-pql',  # -p preview, -q quality, -l low
        '--output_file', job_id,
        '--output_dir', output_path,
        script_path
    ]

    try:
        # Check if manim is installed first
        try:
            subprocess.run(['manim', '--version'], capture_output=True, check=True)
        except (subprocess.CalledProcessError, FileNotFoundError):
            return {
                'id': job_id,
                'status': 'failed',
                'error': 'Manim not installed. Install with: pip install manim or brew install manim',
                'script_path': script_path,
                'suggestion': 'Code generated successfully but rendering requires Manim installation'
            }

        # Run manim (this takes time)
        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            timeout=300  # 5 minute timeout
        )

        # Look for the output file
        video_file = os.path.join(output_path, 'videos', '1080p60', f'{job_id}.mp4')

        if os.path.exists(video_file):
            return {
                'id': job_id,
                'status': 'completed',
                'video_url': f'/api/output/{job_id}/{job_id}.mp4',
                'output_path': video_file
            }
        else:
            return {
                'id': job_id,
                'status': 'failed',
                'error': result.stderr or 'Video file not generated',
                'manim_output': result.stdout
            }

    except subprocess.TimeoutExpired:
        return {
            'id': job_id,
            'status': 'failed',
            'error': 'Rendering timeout (5 minutes)'
        }
    except FileNotFoundError:
        return {
            'id': job_id,
            'status': 'failed',
            'error': 'Manim not found in PATH. Please install Manim.',
            'script_path': script_path
        }
    except Exception as e:
        return {
            'id': job_id,
            'status': 'failed',
            'error': str(e)
        }