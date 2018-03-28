/* #99 Fixes (most) transactions that are behind a day due to daylight savings */
UPDATE transactions SET date=DATE_ADD(date, INTERVAL 1 DAY)
    WHERE (date>"2018/03/25")
    OR (date>"2017/03/26" AND date<="2017/10/29")
    OR (date>"2016/03/27" AND date<="2017/10/30")
    OR (date>"2015/03/29" AND date<="2015/10/25")
    OR (date>"2014/03/30" AND date<="2014/10/26")
    OR (date>"2013/03/31" AND date<="2013/10/27")
    OR (date>"2012/03/25" AND date<="2012/10/28")
    