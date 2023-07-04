export const checktimes = (starttime, endtime) => {

    const startTime = new Date();
    const endTime = new Date();


    startTime.setHours(starttime.slice(0,2), starttime.slice(3,5), starttime.slice(6,8));
    endTime.setHours(endtime.slice(0,2), endtime.slice(3,5), endtime.slice(6,8));

    console.log(endTime > startTime)

    if (endTime > startTime) {
        return true;
    }

    return false;

  }