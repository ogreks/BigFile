var file_md5   = '';   
// 用于MD5校验文件
var block_info = [];   
// 用于跳过已有上传分片

// 创建上传
var uploader = WebUploader.create({
    swf: './public/webuploader-0.1.5/Uploader.swf',
    server: './php/test.php?fun=index',          // 服务端地址
    pick: '#picker',              // 指定选择文件的按钮容器
    resize: false,
    chunked: true,                //开启分片上传
    chunkSize: 1024 * 1024 * 0.5,   //每一片的大小
    chunkRetry: 100,              // 如果遇到网络错误,重新上传次数
    threads: 3,                   // [默认值：3] 上传并发数。允许同时最大上传进程数。
});

// 上传提交
function FileStart() {
    log('准备上传...');
    uploader.upload();
}

// 当有文件被添加进队列的时候-md5序列化
uploader.on('fileQueued', function (file) {

    log("正在计算MD5值...");
    uploader.md5File(file)

    .then(function (fileMd5) {
        file.wholeMd5 = fileMd5;
        file_md5 = fileMd5;
        log("MD5计算完成。");

        // 检查是否有已经上传成功的分片文件
        $.post('./php/test.php?fun=check', {md5: file_md5}, function (data) {
            data = JSON.parse(data);

            // 如果有对应的分片，推入数组
            if (data.block_info) {
                for (var i in data.block_info) {
                    block_info.push(data.block_info[i]);
                }
                log("有断点...");
            }
        })
    });
});

// 发送前检查分块,并附加MD5数据
uploader.on('uploadBeforeSend', function( block, data ) {
    var file = block.file;
    var deferred = WebUploader.Deferred();  

    data.md5value = file.wholeMd5;
    data.status = file.status;

    if ($.inArray(block.chunk.toString(), block_info) >= 0) {
        log("已有分片.正在跳过分片"+block.chunk.toString());
        deferred.reject();  
        deferred.resolve();
        return deferred.promise();
    }
});

// 上传完成后触发
uploader.on('uploadSuccess', function (file,response) {
    log("上传分片完成。");
    log("正在整理分片...");
    $.post('./php/test.php?fun=merge', { md5: file.wholeMd5, fileName: file.name }, function (data) {
        var object = JSON.parse(data);
        if (object.code) {
            log("上传成功");
        }
    });
});

// 文件上传过程中创建进度条实时显示。
uploader.on('uploadProgress', function (file, percentage) {
    $("#percentage_a").css("width",parseInt(percentage * 100)+"%");
    $("#percentage").html(parseInt(percentage * 100) +"%");
});

// 上传出错处理
uploader.on('uploadError', function (file) {
    uploader.retry();
});

// 暂停处理
$("#stop").click(function(e){
    log("暂停上传...");
    uploader.stop(true);
})

// 从暂停文件继续
$("#start").click(function(e){
    log("恢复上传...");
    uploader.upload();
})

function log(html) {
    $("#log").append("<div>"+html+"</div>");
}
