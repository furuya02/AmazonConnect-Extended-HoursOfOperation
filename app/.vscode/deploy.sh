export Profile=XXXXX
export BucketName=aws-sam-template-bucket
export ZipName=/tmp/upload.zip

#--------------- SAM更新 ---------------------------
export StackName=Connect-Extended-Operation-Of-Tiime

sam package --output-template-file packaged.yaml --s3-bucket ${BucketName} --p ${Profile}
sam deploy --template-file packaged.yaml --stack-name ${StackName} --capabilities CAPABILITY_IAM --p ${Profile} 

#--------------- Lambdaのみ更新 ---------------------------
# Lambda関数名：CludFormation の出力から取得する
# export FunctionNam=Connect-Extended-Operation-Of-Tiime-Function-xxxxxx 

# rm ${ZipName} 
# cd dst
# zip -r ${ZipName} index.js node_modules
# aws lambda update-function-code --function-name ${FunctionNam}  --zip-file fileb://${ZipName} --publish --p ${Profile}

#--------------- スタックの削除 ---------------------------
# $ aws cloudformation delete-stack --stack-name ${StackName} --p ${Profile}