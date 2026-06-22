import { CHAMPION_ICONS, CHAMPION_COSTS, ITEM_ICONS, TRAIT_ICONS } from './champions.generated'

export function traitIcon(traitId: string): string | undefined {
    return TRAIT_ICONS[traitId]
}
export function championIcon(characterId: string): string | undefined {
    return CHAMPION_ICONS[characterId]
}

export function championCost(characterId: string): number | undefined {
    return CHAMPION_COSTS[characterId]
}

export function itemIcon(itemName: string): string | undefined {
    return ITEM_ICONS[itemName]
}