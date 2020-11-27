const fs = require('fs');
const data = require('./propertyHistoryAggregationData.js');
// console.log(data)
function aggregateHistory(propertyHistory) {
    try {
        let aggregatedHistory = [];
        console.time('start aggregation');
        const noOfUnits = 250;
        for (let history of propertyHistory) {
            // history = history._source;

            const dataSource = history.dataSource;
            const date = history.surveyDate.split('-');
            const prevSurveyDate = `${date[0] - 1}-${date[1]}`;
            const currentSurveyDate = `${date[0]}-${date[1]}`;
            let isSameStore = false;
            let isIncluded = true;


            history.occupancyRate = history.occupancyRate == null ? 85 : history.occupancyRate;
            let currentMonthHistory = {
                surveyDate: history.surveyDate,
                units: noOfUnits,
                rentPerunit: history.effectiveRentUnitBedAmount,
                occupancyrate: history.occupancyRate,
                dataSource,
            }

            // case: empty propertyhistory
            if (!aggregatedHistory.length) {
                currentMonthHistory.isSameStore = false;
                currentMonthHistory.isIncluded = isIncluded;
                aggregatedHistory.push(currentMonthHistory);
                continue;
            }
            // console.log(aggregatedHistory.length)
            // todo

            let sameYearCurrentMonthHistory = aggregatedHistory.filter(history => {
                const currentDate = history.surveyDate.split('-');
                return `${currentDate[0]}-${currentDate[1]}` === currentSurveyDate;
            });

            let lastYearCurrentMonthHistory = aggregatedHistory.filter(history => {
                const currentDate = history.surveyDate.split('-');
                return `${currentDate[0]}-${currentDate[1]}` === prevSurveyDate;
            });

            aggregatedHistory = aggregatedHistory.filter(history => {
                const currentDate = history.surveyDate.split('-');
                return `${currentDate[0]}-${currentDate[1]}` !== prevSurveyDate && `${currentDate[0]}-${currentDate[1]}` !== currentSurveyDate;
            });

            // console.log(aggregatedHistory.length)

            if (lastYearCurrentMonthHistory.length) {
                lastYearCurrentMonthHistory.forEach(monthlyHistory => {
                    if (monthlyHistory.dataSource === dataSource) {
                        monthlyHistory.isIncluded = true;
                        isSameStore = true;
                    } else {
                        monthlyHistory.isIncluded = false;
                    }
                })

            }


            if (sameYearCurrentMonthHistory.length) {
                if (dataSource == 'Yardi') {
                    sameYearCurrentMonthHistory[0].isIncluded = false;
                    sameYearCurrentMonthHistory[0].isSameStore = false;
                } else {
                    isIncluded = false
                }
            }


            // && history.effectiveRentUnitBedAmount !== null
            // else {
            //     if (history.effectiveRentUnitBedAmount === null) {
            //         currentMonthHistory.isSameStore = isSameStore;
            //         currentMonthHistory.isIncluded = isIncluded;
            //         aggregatedHistory.push(currentMonthHistory);
            //         continue;
            //     }
            // }




            currentMonthHistory.isSameStore = isSameStore;
            currentMonthHistory.isIncluded = isIncluded;

            sameYearCurrentMonthHistory = sameYearCurrentMonthHistory.filter(month => {
                const currentDate = history.surveyDate.split('-');
                return `${currentDate[0]}-${currentDate[1]}` === currentSurveyDate && month.dataSource !== dataSource;
            })
            // console.log(sameYearCurrentMonthHistory)

            sameYearCurrentMonthHistory.push(currentMonthHistory);
            lastYearCurrentMonthHistory = lastYearCurrentMonthHistory.concat(sameYearCurrentMonthHistory);
            aggregatedHistory = aggregatedHistory.concat(lastYearCurrentMonthHistory);

        }
        console.timeEnd('start aggregation');

        return aggregatedHistory;
    } catch (e) {
        console.log('exception in aggregateHistory', e);
        return false;
    }
}

let history = aggregateHistory(data.data[4].marketDashboardQueryRes)
// aggregateHistory(data[1].marketDashboardQueryRes)

fs.writeFileSync('./history.json', JSON.stringify(history.sort((a, b) => a.surveyDate - b.surveyDate), undefined, 2))