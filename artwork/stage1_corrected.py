import ast, asyncio
from pathlib import Path
from painting_ui import Painter
module=ast.parse(Path('artwork/stage1_outlines.py').read_text())
paths=next(ast.literal_eval(n.value) for n in module.body if isinstance(n,ast.Assign) and any(isinstance(t,ast.Name) and t.id=='paths' for t in n.targets))
async def main():
    async with Painter() as p:
        await p.tool('brush'); await p.size(2)
        for name,points in paths:
            await p.drag(points)
            print('Mouse outline:',name,flush=True)
        await p.shot('stage1-clean-outlines.png')
asyncio.run(main())
