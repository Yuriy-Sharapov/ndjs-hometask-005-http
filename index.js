#!/usr/bin/env node
   
const dotenv = require('dotenv').config(); // подключаем работу с переменными среды окружения
const yargs = require('yargs/yargs')        
const { hideBin } = require('yargs/helpers')

const argv = yargs(hideBin(process.argv))       // Задаем аргументы
    .option('place', {
        alias: "p",
        type: "string",
        description: "Название города на английском языке, для которого требуется вывести прогноз погоды" 
    })   
    .argv

if (process.argv.slice(2).length != 2
    || ( process.argv.slice(2)[0] != '-p' && process.argv.slice(2)[0] != '--place' ) ){

    console.log("Некорректный запуск команды weather. Запустите weather --help")
    return
}

// Получаем город, для которого запрашивается погода
let place = process.argv.slice(2)[1]

// Получаем API ключ через импортируемую функцию
const {getAPIKey} = require('./config.js')
//const APIKey = process.env.APIKey

// Сервис погоды - https://www.weatherapi.com/
const url = `http://api.weatherapi.com/v1/current.json?key=${getAPIKey()}&q=${place}&aqi=no`

const http = require('http');
const { config } = require('yargs');

http.get(url, (res) =>{

    // Обработка некорректного статуса
    const {statusCode} = res
    if (statusCode != 200) {
        console.log(`statusCode: ${statusCode}`)
        let errRawData = [];
        res.on('data', (c) => errRawData += c)
        res.on('end', () => {
            //console.log(`Город не найден. Проверьте название города`)
            let parseErrData = JSON.parse(errRawData)
            console.log(parseErrData.error.message);
        });        
        return
    }

    res.setEncoding('utf8')
    let rawData = ''
    res.on('data', (chunk) => rawData += chunk)
    res.on('end', () => {
        let parseData = JSON.parse(rawData)
        console.log(`Город ${parseData.location.name}`)
        console.log(`Страна ${parseData.location.country}`)
        let date = parseData.current.last_updated.replace(/^(\d{4})\-(\d{2})\-(\d{2})/,`$3.$2.$1`)
        console.log(`Дата и время обновления температуры ${date}`)
        console.log(`Температура ${parseData.current.temp_c}° С`)
    })
}).on('error', (err) => {
    console.error(err) 
})