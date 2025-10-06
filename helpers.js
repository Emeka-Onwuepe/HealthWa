export const getQueryData = (querydata,list=false) =>{
    // console.log(querydata)
    let data = querydata.rows
    
    if (data.length < 1) return null

    if (data.length == 1 && !list)
        data = data[0]
    return data 
}