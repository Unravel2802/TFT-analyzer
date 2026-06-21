import { CHAMPION_ICONS } from './champions.generated'

export function championIcon(characterId: string): string | undefined {
    return CHAMPION_ICONS[characterId]
}