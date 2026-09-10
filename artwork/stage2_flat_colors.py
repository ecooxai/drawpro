import asyncio
from painting_ui import Painter
async def main():
    async with Painter() as p:
        await p.fill('#f3d4c5',[(570,343),(503,519),(509,526),(644,508),(641,523),(548,578),(596,578)])
        await p.shot('stage2-skin-left.png')
        await p.fill('#f6d0b4',[(950,320),(951,367),(861,440),(1023,315),(993,361),(981,381),(925,550),(967,550)])
        await p.shot('stage2-skin-both.png')
        await p.fill('#332d39',[(523,282),(528,370),(529,410),(618,370),(623,411)])
        await p.fill('#273d48',[(938,290),(921,310),(986,307),(969,339),(889,364),(991,343),(992,363),(997,378)])
        await p.shot('stage2-hair.png')
        await p.fill('#f4f2f5',[(568,407),(503,440),(635,440)])
        await p.fill('#928898',[(572,500)])
        await p.fill('#fff7e7',[(942,419),(921,393),(971,388)])
        await p.fill('#346577',[(927,483),(963,483)])
        await p.fill('#82709e',[(933,730),(1008,730)])
        await p.fill('#e2dce9',[(935,713),(998,713)])
        await p.tool('brush')
        await p.shot('stage2-flat-colors.png')
        print('Flat colors completed through the visible color picker and fill bucket.')
asyncio.run(main())
