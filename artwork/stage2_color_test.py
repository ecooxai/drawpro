import asyncio
from painting_ui import Painter
async def main():
    async with Painter() as p:
        await p.fill('#f3d4c5',[(570,290)])
        await p.shot('stage2-color-test.png')
asyncio.run(main())
