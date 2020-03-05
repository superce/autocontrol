// 格式化时间
export function dateFormat(date){   
    if(date){
        let time = date.split('T')
        let year = time[0]
        let day = time[1]
        if(day.includes('Z')){
            day = day.split('Z')[0]
        }
        if(day.includes('.')){
            day = day.split('.')[0]
        }
        if(day.includes('+')){
            day = day.split('+')[0]
        }
        return `${year} ${day}`   
    }
}
// 选择时间时，对时间格式处理
export function repliceDate(date){
    if (date) {
        let time8 = 1000 * 60 * (8 * 60)
        let newData = date.getTime() + time8
        date = new Date(newData)
        date = date.toISOString().split('T')[0]
    } else {
        date = ''
    }
    return date
}