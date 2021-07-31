const params = new URLSearchParams(location.search)

export const roomId = params.get('room_id') || 'misheard-default'
export const lang = params.get('lang') || 'en_US'
export const langIsSet = !!params.get('lang')