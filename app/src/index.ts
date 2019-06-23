
import * as AWS from 'aws-sdk';
const bucketName = process.env.BucketName;
const s3  = new AWS.S3(); 
const key = 'OperationTime.txt';

export const handler = async (event: any, _context: any) => {
    console.log(JSON.stringify(event));

    let inTime = false;

    // オペレーション時間の取得
    const data = await s3.getObject({
        Bucket: bucketName,
        Key: key
    }).promise();

    if(data.Body){
        const operationTime = data.Body.toString();
        var lines = operationTime.split('\n');
    
        // コメント削除及び、余分な空白削除
        lines = lines.map( (line:String) => {
            return line.replace(/#.*$/, '').replace(/\s+$/, '');
        });
        // 無効（空白）行の削除
        lines = lines.filter( (line:string) => {
            return line != '';
        });
        // 時間内かどうかのチェック
        inTime = CheckInTime(lines);
    }
    console.log(inTime ? '営業時間内' : '営業時間外' )
    return { inTime: inTime };
}
 
function CheckInTime(lines: String[]) {
    // 現在時間
    const now = new Date();
    const month = now.getMonth() + 1;
    const day = now.getDate();
    const week = now.getDay();
    const hour = now.getHours();
    const miniute = now.getMinutes();

    var weekdays = ["日", "月", "火", "水", "木", "金", "土"];

    console.log('現在時間: ' + month + '/' + day + '(' + weekdays[week] + ') ' + hour + ':' + miniute)

    // 曜日指定の抽出
    const weeks = lines.filter(line => {
        return 0 < weekdays.indexOf(line.split(',')[0]);
    });

    // 祝日指定の抽出
    const holidays = lines.filter(line => {
        return line.split(',')[0].split('/').length == 2;
    });

    // 曜日チェック
    let flg = false; // デフォルトで時間外（設定がない場合時間外となるため）
    weeks.forEach( line => {
        const tmp = line.split(',');
        const w = weekdays.indexOf(tmp[0]);
        if(week == w) { // 当該曜日の設定
            // 始業時間以降かどうかのチェック
            let t = tmp[1].split(':');
            if(t.length == 2) {
                if( Number(t[0]) * 60 + Number(t[1]) <= (hour * 60 + miniute )){
                    // 終業時間前かどうかのチェック
                    t = tmp[2].split(':');
                    if(t.length == 2) {
                        if((hour * 60 + miniute ) <= (Number(t[0]) * 60 + Number(t[1]))){
                            flg = true;
                        }
                    }
                }
            }
        }
    });

    // 曜日指定で時間外の場合は、祝日に関係なく時間外となる
    if(!flg) {
        return false;
    }

    // 祝日のチェック
    flg = true; // 設定がない場合時間内となるため、デフォルトで時間内
    holidays.forEach( line => {
        const tmp = line.split(',');
        const date = tmp[0].split('/');
        if(date.length == 2){
            if(month == Number(date[0]) && day == Number(date[1])){
                console.log('祝日指定に該当')
                flg = false;
            }
        }
    })
    return flg;
}

