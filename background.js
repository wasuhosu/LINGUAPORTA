// デフォルトのGAS URL
const defaultGasUrl = "https://script.google.com/macros/s/AKfycbzt9E7IMfXDy-tqPejjKyQgtytEi4YuXVRS9I7nuDPWut3zprueHne9k3s7lUXPl4DctA/exec";

// 拡張機能インストール時の初期設定
chrome.runtime.onInstalled.addListener(function(details) {
    if (details.reason === "install") {
        console.log("LINGUAPORTA拡張機能がインストールされました");
        
        // 初期値を設定
        const initialSettings = {
            gas_url: defaultGasUrl,
            set_score: 100,
            set_late: 8000, // 8秒
            set_wrong_question: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], // 正答率約60%
            set_run_unit: ["単語の意味", "空所補充"]
        };
        
        chrome.storage.local.set(initialSettings, function() {
            console.log("初期設定を完了しました:", initialSettings);
        });
    } else if (details.reason === "update") {
        console.log("LINGUAPORTA拡張機能が更新されました");
        
        // 更新時に不足している設定があれば追加
        chrome.storage.local.get(null, function(result) {
            const updates = {};
            
            if (!result.gas_url) {
                updates.gas_url = defaultGasUrl;
            }
            
            if (Object.keys(updates).length > 0) {
                chrome.storage.local.set(updates, function() {
                    console.log("更新時に設定を追加しました:", updates);
                });
            }
        });
    }
});

chrome.runtime.onMessage.addListener(
    function (request, sender, callback) {
        console.log(request);
        console.info(JSON.stringify(request));

        // ストレージからGAS URLを取得
        chrome.storage.local.get(['gas_url'], function(result) {
            const gasUrl = result.gas_url || defaultGasUrl;
            
            console.log("使用するGAS URL:", gasUrl);
            
            var json_asocc = request;
            fetch(gasUrl, {
                method: 'post',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: JSON.stringify(json_asocc)
            })
                .then(response => response.json())
                .then(data => {
                    console.log(data);
                    console.log(JSON.stringify(data));
                    callback(data);
                })
                .catch(error => {
                    // ネットワークエラーでも !response.ok でもここで処理できる
                    console.error("GAS通信エラー:", error);
                    console.error(error.toString());
                    callback({ status: "error", message: error.toString() });
                });
        });
        
        // 非同期を同期的に扱うためのtrue
        return true;
    }
);
