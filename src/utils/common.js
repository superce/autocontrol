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
