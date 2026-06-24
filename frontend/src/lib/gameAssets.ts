import { CHAMPION_COSTS, ITEM_ICONS, TRAIT_ICONS } from './gameAssets.generated'

export function championFace(characterId: string): string {
    return `https://ap.tft.tools/img/face/${characterId.toLowerCase()}.jpg?w=96`
}

export function traitIcon(traitId: string): string | undefined {
    return TRAIT_ICONS[traitId]
}

export function championCost(characterId: string): number | undefined {
    return CHAMPION_COSTS[characterId]
}

export function itemIcon(itemName: string): string | undefined {
    return ITEM_ICONS[itemName]
}