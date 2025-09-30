console.debug("リンガポルタ拡張機能作動 version:" + chrome.runtime.getManifest().version);
const ALLOW_PAGE_TRANSLATION = 1;
if (ALLOW_PAGE_TRANSLATION == 0) {
  console.warn("ページ遷移オフ");
}
chrome.storage.local.get(null, function (_0x44eb48) {
  console.debug(JSON.stringify(_0x44eb48));
  if (_0x44eb48.id == null && document.body.className != "page-login") {
    console.error("idが設定されていません");
    _0x323774();
  }
  let _0x1ffd35 = "";
  let _0x455679 = 0;
  if (document.getElementsByClassName("problem-title")[0] != null && document.getElementsByClassName("page-title")[0].children[0] != null) {
    _0x455679 = document.getElementsByClassName("problem-title")[0].innerText.split("：")[1] - 1 + Number(document.getElementsByClassName("page-title")[0].children[0].innerText.split(")")[0].slice(1).split("-")[0]);
  }
  let _0x2a4552 = 0;
  if (document.getElementsByClassName("score-number")[1] != null) {
    _0x2a4552 = Number(document.getElementsByClassName("score-number")[1].innerText);
  }
  let _0x192d8 = "";
  let _0x5b9cf3 = [];
  let _0x30fcb6 = "";
  let _0x15c320 = "";
  let _0x48fde8 = "";
  if (document.getElementById("question_td") != null) {
    document.getElementById("question_td").innerHTML = document.getElementById("question_td").innerHTML.replace(/<br>/g, "");
  }
  if (document.body.className == "page-problem") {
    _0x192d8 = document.getElementsByClassName("page-title")[0].children[0].innerText.split(")")[1];
  } else {
    _0x192d8 = "一覧";
  }
  if (document.body.className == "page-login") {
    _0x1ffd35 = "ログイン画面";
  } else if (document.body.className == "page-home") {
    _0x1ffd35 = "ホーム画面";
  } else if (document.body.className == "page-study") {
    _0x1ffd35 = "書籍選択画面";
  } else if (document.body.className == "page-units page-categories") {
    _0x1ffd35 = "学習ユニット選択画面";
  } else if (document.body.className == "page-portfolio") {
    _0x1ffd35 = "学習結果表示画面";
  } else if (_0x192d8 == "空所補充") {
    if (document.getElementById("true_msg") == null && document.getElementById("false_msg") == null && document.getElementById("tabindex1") != null) {
      _0x1ffd35 = "空所補充-問題出題画面";
    } else if (document.getElementById("false_msg") != null) {
      _0x1ffd35 = "空所補充-不正解画面";
    } else if (document.querySelector("#question_area > div.qu03 > input[type=text]") != null) {
      _0x1ffd35 = "空所補充-正解表示画面";
    } else if (document.getElementById("true_msg") != null && document.getElementsByClassName("problem-next-group")[0].innerText.slice(-2) != "終了") {
      _0x1ffd35 = "空所補充-正解後の画面";
    } else if (document.getElementById("true_msg") != null) {
      _0x1ffd35 = "空所補充-全問題終了画面";
    } else {
      console.error("ページの特定に失敗");
    }
  } else if (_0x192d8 == "単語の意味") {
    if (document.getElementById("drill_form") != null && document.getElementById("commentary") == null && document.querySelector("#drill_form > font") == null) {
      _0x1ffd35 = "単語の意味-問題出題画面";
    } else if (document.querySelector("#drill_form > font") != null && document.getElementById("true_msg") == null) {
      _0x1ffd35 = "単語の意味-不正解画面";
    } else if (document.getElementById("drill_form") != null && document.getElementById("true_msg") == null && document.getElementById("under_area").innerText.indexOf("全問終了") == -1) {
      _0x1ffd35 = "単語の意味-正解表示画面";
    } else if (document.getElementById("true_msg") != null && document.getElementsByClassName("problem-next-group")[0].innerText.slice(-2) != "終了") {
      _0x1ffd35 = "単語の意味-正解後の画面";
    } else if (document.getElementsByClassName("problem-next-group")[0].innerText.slice(-2) == "終了") {
      _0x1ffd35 = "単語の意味-全問題終了画面";
    } else {
      _0x1ffd35 = "不明";
      console.error("ページの特定に失敗");
    }
  } else if (document.querySelector("#problem-area").innerText == "問題が有りません。") {
    _0x1ffd35 = "全問題終了画面で再読み込み";
  } else {
    console.error("ページの特定に失敗");
  }
  switch (_0x1ffd35) {
    case "ログイン画面":
      console.debug("location:" + _0x1ffd35);
      function _0x52b54d() {
        document.getElementById("current-value_late").innerText = document.getElementById("slider_late").value + "秒";
        document.getElementById("current-value_score").innerText = document.getElementById("slider_score").value + "点";
        document.getElementById("current-value_correct_answer_rate").innerText = Math.round(25 / (150 - document.getElementById("slider_correct_answer_rate").value) * 100) + "%";
        let _0x18cc37 = [];
        for (let _0x3db233 = 0; _0x3db233 < Math.floor((125 - document.getElementById("slider_correct_answer_rate").value) / 25); _0x3db233++) {
          _0x18cc37.push(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25);
        }
        for (let _0x6b8d7d = 1; _0x6b8d7d <= Math.floor((125 - document.getElementById("slider_correct_answer_rate").value) % 25); _0x6b8d7d++) {
          _0x18cc37.push(_0x6b8d7d);
        }
        let _0x1e77d8 = Number(document.getElementById("slider_late").value) * 1000;
        let _0xba3274 = 0;
        let _0xc82fda = "";
        let _0x4b4b22 = [];
        document.querySelectorAll("input[name=\"unit_selection\"]").forEach(_0x915b44 => {
          if (_0x915b44.checked) {
            _0x4b4b22.push(_0x915b44.value);
          }
        });
        if (document.getElementById("switch").checked) {
          document.querySelector(".current-status").textContent = "自動化ON";
          document.getElementsByClassName("stats-pannel ranking")[0].classList.remove("display-none");
          _0xba3274 = Number(document.getElementById("slider_score").value);
        } else {
          document.querySelector(".current-status").textContent = "自動化OFF";
          document.getElementsByClassName("stats-pannel ranking")[0].classList.add("display-none");
          _0xba3274 = -2;
          _0x1e77d8 = null;
          _0x18cc37 = null;
          _0x4b4b22 = null;
        }
        chrome.storage.local.set({
          id: document.getElementsByName("id")[0].value,
          password: document.getElementsByName("password")[0].value,
          set_score: _0xba3274,
          set_late: _0x1e77d8,
          set_wrong_question: _0x18cc37,
          set_run_unit: _0x4b4b22
        }, function () {});
      }
      document.getElementsByClassName("body")[0].innerHTML = "<form action='/user/seibido/' method='POST'><input type='hidden' name='login' value='login'><div class='login-error-block'></div><div class='input-with-icon login-input-text'><i class='las la-smile'></i><input type='text' name='id' autocomplete='username' placeholder='User ID'></div><div class='input-with-icon login-input-text'><i class='las la-key'></i><div class='password-wrapper'><input type='password' name='password' autocomplete='current-password' placeholder='Password'><button class='button button-trans passwdViewBtn' type='button'>表示</button></div></div><script>makePasswordVisible(document.querySelector('input[type=password]'));</script><div class='login-optx '><a href='resetpw.php'>パスワードを忘れた方&nbsp;<i class='las la-arrow-right'></i></a><a href='https://www.seibido.co.jp/linguaporta/register.html' target='_blank'>リンガポルタの使い方&nbsp;<i class='las la-arrow-right'></i></a></div><div class='center_RL'><label for='switch' class='switch_label'><div class='switch'><input type='checkbox' id='switch' checked /><div class='circle'></div> <div class='base'></div></div><span class='current-status'>OFF</span></label></div><div class='stats-pannel ranking'><div class='title'>SETTINGS</div><div class='body'><table id='table_setting' class='table_original'><tbody><tr id='tr_setting_score'><th style='width:7em;'>獲得するスコア</th><td id='current-value_score' class='current-value' style='width:3em; border-right:none;'></td><td><input type='range' id='slider_score' min='25' max='300' step='25' value='100' style='width:100%' title='自動実行で獲得するスコアを選択します'></td></tr><tr id='tr_setting_late'><th>回答入力遅延</th><td id='current-value_late' class='current-value' style='border-right:none;'></td><td><input type='range' id='slider_late' min='0' max='20' step='1' value='8' style='width:100%' title='回答入力時の遅延を選択します(管理者に自動化ツールと判断されないようにするため)'></td></tr><tr id='tr_setting_rate'><th>正答率</th><td id='current-value_correct_answer_rate' class='current-value' style='border-right:none;'></td><td><input type='range' id='slider_correct_answer_rate' min='50' max='125' step='1' value='115' style='width:100%' title='正答率を選択します(サーバー上に答えがない場合は50%になります)(管理者に自動化ツールと判断されないようにするため)'></td></tr><tr><th>単元</th><td colspan='2' style='text-align:left !important;'><label><input type='checkbox' id='unit_selection_0' name='unit_selection' value='単語の意味' title='単語の意味' checked>単語の意味</label><label><input type='checkbox' id='unit_selection_1' name='unit_selection' value='空所補充' title='空所補充' checked>空所補充</label></td></tr></tbody></table></div></div><div class='login-btn'><button type='submit' value='LOGIN' class='button button-secondary button-big'>スタート</button></div></form> <a href='https://github.com/Raptor-zip/LINGUAPORTA/' class='bookmark source'><div class='bookmark-info'><div class='bookmark-text'><div class='bookmark-title'>《使い方》リンガポルタ自動化ツール</div></div><div class='bookmark-href'><img src='https://github.com/fluidicon.png' class='icon bookmark-icon'>https://github.com/Raptor-zip/LINGUAPORTA/</div></div></a>";
      if (_0x44eb48.id != null) {
        document.getElementsByName("id")[0].value = _0x44eb48.id;
      }
      if (_0x44eb48.password != null) {
        document.getElementsByName("password")[0].value = _0x44eb48.password;
      }
      if (_0x44eb48.configured_score != null) {
        console.log("configured_score", _0x44eb48.configured_score);
        document.getElementById("slider_score").value = Math.round(_0x44eb48.learning_time * 10 / _0x44eb48.score) / 10 + "秒";
      }
      if (_0x44eb48.configured_late != null) {
        console.log("configured_late", _0x44eb48.configured_late);
        document.getElementById("slider_late").value = Math.round(_0x44eb48.learning_time * 10 / _0x44eb48.score) / 10 + "秒";
      }
      if (_0x44eb48.configured_rate != null) {
        console.log("configured_rate", _0x44eb48.configured_rate);
        document.getElementById("slider_correct_answer_rate").value = Math.round(_0x44eb48.learning_time * 10 / _0x44eb48.score) / 10 + "秒";
      }
      _0x52b54d();
      const _0x48d773 = Object.freeze(["slider_score", "slider_late", "slider_correct_answer_rate", "unit_selection_0", "unit_selection_1", "switch"]);
      for (let _0x401735 = 0; _0x401735 < _0x48d773.length; _0x401735++) {
        document.getElementById(_0x48d773[_0x401735]).addEventListener("change", _0x52b54d);
      }
      break;
    case "ホーム画面":
      console.debug("location:" + _0x1ffd35);
      _0x274bf3();
      if (_0x44eb48.set_score > -2) {
        chrome.storage.local.set({
          rank: Number(document.getElementsByClassName("score-number text-right")[0].innerText)
        }, function () {
          if (ALLOW_PAGE_TRANSLATION) {
            document.querySelector("#spmenu-nav > a:nth-child(2)").click();
          }
        });
      }
      break;
    case "書籍選択画面":
      console.debug("location:" + _0x1ffd35);
      if (_0x44eb48.set_score > -2) {
        document.getElementsByClassName("button-secondary")[0].click();
      }
      break;
    case "学習ユニット選択画面":
      console.debug("location:" + _0x1ffd35);
      _0x274bf3();
      if ("set_score" in _0x44eb48) {
        if (_0x44eb48.set_score > 0) {
          async function _0x450914(_0x541fa2 = 1) {
            let _0x4685c1 = _0x44eb48.score_per_mode;
            let _0x5d0f25 = "";
            if (_0x4685c1 == null) {
              _0x5d0f25 = "空所補充";
            } else if (_0x44eb48.set_run_unit.every(_0x39c5c6 => Object.keys(_0x4685c1).includes(_0x39c5c6))) {
              let _0x5d38f0 = Object.keys(_0x4685c1).filter(_0x5c770c => _0x44eb48.set_run_unit.includes(_0x5c770c)).reduce((_0x323ecc, _0x2e14d5) => {
                _0x323ecc[_0x2e14d5] = _0x4685c1[_0x2e14d5];
                return _0x323ecc;
              }, {});
              _0x5d0f25 = Object.keys(_0x5d38f0).reduce((_0x25d659, _0xd0ef6e) => _0x5d38f0[_0x25d659] < _0x5d38f0[_0xd0ef6e] ? _0x25d659 : _0xd0ef6e);
            } else {
              _0x5d0f25 = _0x44eb48.set_run_unit[0];
            }
            let _0x2c277c = "user/units.php";
            let _0xf4695b = new URLSearchParams();
            _0xf4695b.append("reference_num", "70");
            _0xf4695b.append("search", _0x5d0f25);
            if (_0x541fa2 > 1) {
              _0xf4695b.append("unit_list_page", _0x541fa2);
            } else {
              _0xf4695b.append("paging_size", "50");
            }
            let _0x5d3f29 = await fetch(_0x2c277c, {
              method: "POST",
              body: _0xf4695b,
              headers: {
                "Content-Type": "application/x-www-form-urlencoded"
              }
            });
            if (!_0x5d3f29.ok) {
              throw new Error("HTTP error! status: " + _0x5d3f29.status);
            }
            let _0x2e869d = await _0x5d3f29.text();
            document.getElementById("units_list").innerHTML = _0x2e869d;
            let _0x43e25c = document.getElementsByTagName("table")[0].rows;
            let _0x7b6429 = false;
            for (let _0x3096b4 = 1; _0x3096b4 < _0x43e25c.length; _0x3096b4++) {
              const _0x22f196 = _0x43e25c[_0x3096b4].cells;
              let _0x50bd27 = {
                unit_name: _0x22f196[0].textContent.trim(),
                start_question_number: Number(_0x22f196[0].textContent.trim().split("-")[0].slice(1)),
                end_question_number: Number(_0x22f196[0].textContent.trim().split("-")[1].split(")")[0]),
                score: Number(_0x22f196[1].textContent.trim().split("点")[0]),
                button_onclick: _0x22f196[3].children[0].getAttribute("onclick")
              };
              if (_0x50bd27.button_onclick) {
                _0x7b6429 = true;
                for (let _0x2ef6f5 = _0x50bd27.start_question_number; _0x2ef6f5 < _0x50bd27.end_question_number; _0x2ef6f5++) {
                  _0x5b9cf3.push(_0x2ef6f5);
                }
                const _0x41e09e = _0x50bd27.unit_name.split(")")[1];
                const _0x47ab4a = {
                  id: _0x44eb48.id,
                  request_type: "get",
                  question_number: _0x5b9cf3
                };
                chrome.runtime.sendMessage(_0x47ab4a, _0x115168 => {
                  console.debug(JSON.stringify(_0x115168));
                  if (_0x115168 != undefined) {
                    const _0x39d9db = {
                      ..._0x44eb48.score_per_mode
                    };
                    _0x39d9db[_0x41e09e] = _0x50bd27.start_question_number;
                    let _0x191cd3 = _0x39d9db;
                    let _0x18c393 = {
                      start_question_number: _0x50bd27.start_question_number,
                      start_time: Date.now(),
                      correct_answer_times: 0,
                      incorrect_answer_times: 0,
                      wrong_question_queue: _0x44eb48.set_wrong_question,
                      score_per_mode: _0x191cd3
                    };
                    _0x115168.content.forEach((_0x576244, _0x5a5663) => {
                      _0x18c393["a" + _0x576244[0]] = _0x576244.slice(1, 6);
                    });
                    chrome.storage.local.set(_0x18c393, function () {
                      if (ALLOW_PAGE_TRANSLATION) {
                        let _0x5c6e4a = document.querySelector("#unit-categories-table > form");
                        _0x5c6e4a.sub.value = "drill";
                        _0x5c6e4a.unit_num.value = _0x50bd27.button_onclick.split("'")[3];
                        _0x5c6e4a.category_tag.value = "";
                        _0x5c6e4a.submit();
                      }
                    });
                  }
                });
                break;
              }
            }
            if (!_0x7b6429) {
              _0x450914(_0x541fa2 + 1);
            }
          }
          _0x450914(1);
        } else if (_0x44eb48.set_score == 0) {
          _0x323774();
        }
      } else {
        console.error("エラー");
        _0x323774();
      }
      break;
    case "学習結果表示画面":
      console.debug("location:" + _0x1ffd35);
      let _0x543d93 = [];
      for (let _0x545c3b = 1; _0x545c3b < 4; _0x545c3b++) {
        _0x543d93.push(document.querySelector("body > div > main > section.stats-pannel.portfolio > div.body > div:nth-child(4) > div > span:nth-child(" + _0x545c3b + ")").innerText);
      }
      const _0x3d5ee6 = {
        score: Number(document.getElementsByClassName("xl")[0]),
        challenge_times: Number(document.getElementsByClassName("portfolio-number")[2].innerText.slice(0, -2)),
        learning_time: Number(_0x543d93[0]) * 60 * 60 + Number(_0x543d93[1]) * 60 + Number(_0x543d93[2])
      };
      chrome.storage.local.set(_0x3d5ee6, function () {
        const _0x4902e9 = {
          id: _0x44eb48.id,
          request_type: "portfolio_record",
          score: _0x3d5ee6.score,
          rank: _0x44eb48.rank,
          challenge_times: _0x3d5ee6.challenge_times,
          learning_time: _0x3d5ee6.learning_time
        };
        chrome.runtime.sendMessage(_0x4902e9, _0x258c0a => {
          console.debug(JSON.stringify(_0x258c0a));
          if (_0x44eb48.set_score > 0) {
            if (ALLOW_PAGE_TRANSLATION) {
              document.querySelector("#spmenu-nav > a:nth-child(1)").click();
            }
          } else if (_0x44eb48.set_score == 0) {
            _0x323774();
          } else if (_0x44eb48.set_score != -2) {
            console.error("エラー");
          }
        });
      });
      break;
    case "空所補充-問題出題画面":
      console.debug("location:" + _0x1ffd35);
      if (_0x44eb48.set_score > 0) {
        let _0x47df4d = document.createElement("div");
        _0x47df4d.innerHTML = "<div id='false_msg' class='problem-mark-ng'><i class='las la-times'></i>" + _0x44eb48.set_late / 1000 + "秒後に不正解になります。</div>";
        if (_0x44eb48.wrong_question_queue.includes(_0x2a4552 + 1)) {
          document.getElementById("tabindex1").value = _0x59277f();
          document.getElementById("under_area").before(_0x47df4d);
          _0x4348d6();
        } else {
          key = "a" + String(_0x455679);
          if ([key] in _0x44eb48 && _0x44eb48[key][2] != null && _0x44eb48[key][2] != "") {
            document.getElementById("tabindex1").value = _0x44eb48[key][2];
            _0x47df4d.innerHTML = "<div id='true_msg' class='problem-mark-ok'><i class='las la-check-circle'></i>" + _0x44eb48.set_late / 1000 + "秒後に正解します。</div>";
            document.getElementById("under_area").before(_0x47df4d);
          } else {
            document.getElementById("tabindex1").value = _0x59277f();
            document.getElementById("under_area").before(_0x47df4d);
          }
          _0x4348d6();
        }
      }
      break;
    case "空所補充-不正解画面":
      console.debug("location:" + _0x1ffd35);
      if (_0x44eb48.set_score > 0) {
        let _0x353ca5 = _0x44eb48.wrong_question_queue;
        _0x353ca5.splice(_0x44eb48.wrong_question_queue.indexOf(_0x2a4552 + 1), 1);
        chrome.storage.local.set({
          incorrect_answer_times: _0x44eb48.incorrect_answer_times + 1,
          wrong_question_queue: _0x353ca5
        }, function () {
          if (_0x44eb48.set_score > 0) {
            if (ALLOW_PAGE_TRANSLATION) {
              document.getElementsByClassName("button button-trans problem-view-answer")[0].click();
            }
          }
        });
      }
      break;
    case "空所補充-正解表示画面":
      console.debug("location:" + _0x1ffd35);
      key = "a" + String(_0x455679);
      _0x30fcb6 = document.querySelector("#question_area > div.qu03 > input[type=text]").value.trim();
      _0x48fde8 = key in _0x44eb48 ? [_0x44eb48[key][0], _0x44eb48[key][1], _0x30fcb6, _0x44eb48[key][3], _0x44eb48[key][4]] : [null, null, _0x30fcb6, null, null];
      const _0x4e5ab7 = {
        [key]: _0x48fde8
      };
      chrome.storage.local.set(_0x4e5ab7, function () {
        if (_0x44eb48.set_score > -1 && ALLOW_PAGE_TRANSLATION) {
          document.getElementsByClassName("button button-success button-next-problem")[0].click();
        }
      });
      break;
    case "空所補充-正解後の画面":
    case "空所補充-全問題終了画面":
      console.debug("location:" + _0x1ffd35);
      if (_0x44eb48.set_score > -2) {
        function _0x1e9659() {
          console.log("this_question_info", _0x177bc8);
          if (ALLOW_PAGE_TRANSLATION) {
            if (_0x1ffd35 === "空所補充-正解後の画面") {
              document.getElementsByClassName("button button-success button-next-problem")[0].click();
            } else if (_0x1ffd35 === "空所補充-全問題終了画面") {
              _0x1d263e();
            }
          }
        }
        let _0x177bc8 = {
          question_number: _0x455679,
          question_type: _0x192d8,
          question_answer_1: document.querySelector("#drill_form > b").innerText.slice(1, -1),
          question_answer_2: null
        };
        if ("GAS_set_queue" in _0x44eb48) {
          if (_0x44eb48.GAS_set_queue.length > 3) {
            chrome.storage.local.set({
              GAS_set_queue: [],
              correct_answer_times: _0x44eb48.correct_answer_times + 1
            }, function () {
              let _0x2f31f0 = _0x44eb48.GAS_set_queue;
              _0x2f31f0.push(_0x177bc8);
              const _0x235ba5 = {
                id: _0x44eb48.id,
                request_type: "set",
                content: _0x2f31f0
              };
              chrome.runtime.sendMessage(_0x235ba5, _0x5253bd => {
                console.debug(JSON.stringify(_0x5253bd));
              });
              _0x1e9659();
            });
          } else {
            let _0x2be967 = _0x44eb48.GAS_set_queue;
            _0x2be967.push(_0x177bc8);
            chrome.storage.local.set({
              GAS_set_queue: _0x2be967,
              correct_answer_times: _0x44eb48.correct_answer_times + 1
            }, function () {
              _0x1e9659();
            });
          }
        } else {
          chrome.storage.local.set({
            GAS_set_queue: [_0x177bc8],
            correct_answer_times: _0x44eb48.correct_answer_times + 1
          }, function () {
            _0x1e9659();
          });
        }
      }
      break;
    case "単語の意味-問題出題画面":
      console.debug("location:" + _0x1ffd35);
      if (_0x44eb48.set_score > 0) {
        let _0x416219 = document.createElement("div");
        _0x416219.innerHTML = "<div id='false_msg' class='problem-mark-ng'><i class='las la-times'></i>" + _0x44eb48.set_late / 1000 + "秒後に不正解になります。</div>";
        if (_0x44eb48.wrong_question_queue !== undefined) {
          let _0x4a7f83 = 0;
          if (!_0x44eb48.wrong_question_queue.includes(_0x2a4552 + 1)) {
            key = "a" + String(_0x455679);
            if (_0x44eb48[key] && _0x44eb48[key][1]) {
              let _0x2ff773 = Array.from({
                length: 5
              }, (_0x50ef78, _0x518cdc) => document.getElementById("answer_0_" + _0x518cdc).value);
              let _0x1fd42e = _0x2ff773.indexOf(_0x44eb48[key][1]);
              if (_0x1fd42e !== -1) {
                _0x4a7f83 = _0x1fd42e;
                _0x416219.innerHTML = "<div id='true_msg' class='problem-mark-ok'><i class='las la-check-circle'></i>" + _0x44eb48.set_late / 1000 + "秒後に正解します。</div>";
              }
            }
          }
          document.getElementById("answer_0_" + _0x4a7f83).checked = true;
          document.getElementById("under_area").before(_0x416219);
          _0x4348d6();
        } else {
          console.error("wrong_question_queue is NULL");
          document.getElementById("answer_0_0").checked = true;
          document.getElementById("under_area").before(_0x416219);
          _0x4348d6();
        }
      }
      break;
    case "単語の意味-不正解画面":
      console.debug("location:" + _0x1ffd35);
      if (_0x44eb48.set_score > 0) {
        let _0x425eae = _0x44eb48.wrong_question_queue;
        _0x425eae.splice(_0x44eb48.wrong_question_queue.indexOf(_0x2a4552 + 1), 1);
        chrome.storage.local.set({
          incorrect_answer_times: _0x44eb48.incorrect_answer_times + 1,
          wrong_question_queue: _0x425eae
        }, function () {
          if (ALLOW_PAGE_TRANSLATION) {
            document.getElementsByClassName("button button-trans problem-view-answer")[0].click();
          }
        });
      }
      break;
    case "単語の意味-正解表示画面":
      console.debug("location:" + _0x1ffd35);
      key = "a" + String(_0x455679);
      _0x30fcb6 = document.getElementById("qu02").innerText;
      _0x15c320 = document.getElementById("drill_form").innerText.slice(3, -2);
      _0x48fde8 = key in _0x44eb48 ? [_0x30fcb6, _0x15c320, _0x44eb48[key][2], _0x44eb48[key][3], _0x44eb48[key][4]] : [_0x30fcb6, _0x15c320, null, null, null];
      const _0xa5e702 = {
        [key]: _0x48fde8
      };
      chrome.storage.local.set(_0xa5e702, function () {
        if (_0x44eb48.set_score > -1 && ALLOW_PAGE_TRANSLATION) {
          document.getElementsByClassName("button button-success button-next-problem")[0].click();
        }
      });
      break;
    case "単語の意味-正解後の画面":
    case "単語の意味-全問題終了画面":
      console.debug("location:" + _0x1ffd35);
      if (_0x44eb48.set_score > -2) {
        function _0x59a59d() {
          console.log("this_question_info", _0x1b512a);
          if (ALLOW_PAGE_TRANSLATION) {
            if (_0x1ffd35 === "単語の意味-正解後の画面") {
              document.getElementsByClassName("button button-success button-next-problem")[0].click();
            } else if (_0x1ffd35 === "単語の意味-全問題終了画面") {
              _0x1d263e();
            }
          }
        }
        let _0x1b512a = {
          question_number: _0x455679,
          question_type: _0x192d8,
          question_answer_1: document.getElementById("qu02").innerText,
          question_answer_2: document.getElementById("drill_form").innerText.slice(4, -2)
        };
        if ("GAS_set_queue" in _0x44eb48) {
          if (_0x44eb48.GAS_set_queue.length > 7) {
            chrome.storage.local.set({
              GAS_set_queue: [],
              correct_answer_times: _0x44eb48.correct_answer_times + 1
            }, function () {
              let _0x33f4c8 = _0x44eb48.GAS_set_queue;
              _0x33f4c8.push(_0x1b512a);
              const _0x50294a = {
                id: _0x44eb48.id,
                request_type: "set",
                content: _0x33f4c8
              };
              chrome.runtime.sendMessage(_0x50294a, _0x268900 => {
                console.debug(JSON.stringify(_0x268900));
              });
              _0x59a59d();
            });
          } else {
            let _0x2a34c4 = _0x44eb48.GAS_set_queue;
            _0x2a34c4.push(_0x1b512a);
            chrome.storage.local.set({
              GAS_set_queue: _0x2a34c4,
              correct_answer_times: _0x44eb48.correct_answer_times + 1
            }, function () {
              _0x59a59d();
            });
          }
        } else {
          chrome.storage.local.set({
            GAS_set_queue: [_0x1b512a],
            correct_answer_times: _0x44eb48.correct_answer_times + 1
          }, function () {
            _0x59a59d();
          });
        }
      }
      break;
    case "全問題終了画面で再読み込み":
      console.debug("location:" + _0x1ffd35);
      document.querySelector("body > div > form:nth-child(6)").submit();
    default:
      console.error("エラー");
      console.debug(document.querySelector("html").innerText);
  }
  function _0x274bf3() {
    for (let _0xa5cb61 in _0x44eb48) {
      const _0x348a41 = Object.freeze(["id", "password", "set_score", "set_late", "set_wrong_question", "set_run_unit", "score", "rank", "challenge_times", "learning_time", "wrong_question_queue", "score_per_mode"]);
      if (!_0x348a41.includes(_0xa5cb61)) {
        chrome.storage.local.remove(_0xa5cb61);
      }
    }
  }
  async function _0x323774() {
    if (ALLOW_PAGE_TRANSLATION) {
      const _0x128a53 = "";
      const _0x5cf720 = new URLSearchParams();
      _0x5cf720.append("login", "logout");
      const _0x5f4ec4 = await fetch(_0x128a53, {
        method: "POST",
        body: _0x5cf720,
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        }
      });
      if (!_0x5f4ec4.ok) {
        throw new Error("HTTP error! status: " + _0x5f4ec4.status);
      }
      location.reload();
    }
  }
  function _0x59277f() {
    const _0x49a142 = "abcdefghijklmnopqrstuvwxyz";
    let _0x38e218 = "";
    for (let _0x4ad0cb = 0; _0x4ad0cb < 8; _0x4ad0cb++) {
      _0x38e218 += _0x49a142.charAt(Math.floor(Math.random() * _0x49a142.length));
    }
    return _0x38e218;
  }
  function _0x4348d6() {
    setTimeout(() => {
      if (ALLOW_PAGE_TRANSLATION) {
        document.getElementById("ans_submit").click();
      }
    }, _0x44eb48.set_late);
  }
  function _0x1d263e() {
    const _0x976b31 = window.navigator.userAgent.toLowerCase();
    let _0x1148f8 = "";
    if (_0x976b31.indexOf("edge") !== -1 || _0x976b31.indexOf("edga") !== -1 || _0x976b31.indexOf("edgios") !== -1) {
      _0x1148f8 = "Edge";
    } else if (_0x976b31.indexOf("opera") !== -1 || _0x976b31.indexOf("opr") !== -1) {
      _0x1148f8 = "Opera";
    } else if (_0x976b31.indexOf("samsungbrowser") !== -1) {
      _0x1148f8 = "Samsung Internet Browser";
    } else if (_0x976b31.indexOf("ucbrowser") !== -1) {
      _0x1148f8 = "UC";
    } else if (_0x976b31.indexOf("chrome") !== -1 || _0x976b31.indexOf("crios") !== -1) {
      _0x1148f8 = "Chrome";
    } else if (_0x976b31.indexOf("firefox") !== -1 || _0x976b31.indexOf("fxios") !== -1) {
      _0x1148f8 = "Firefox";
    } else if (_0x976b31.indexOf("safari") !== -1) {
      _0x1148f8 = "Safari";
    } else if (_0x976b31.indexOf("msie") !== -1 || _0x976b31.indexOf("trident") !== -1) {
      _0x1148f8 = "IE";
    } else {
      _0x1148f8 = "error";
    }
    let _0x371bad = "";
    if (_0x976b31.indexOf("windows nt") !== -1) {
      _0x371bad = "Windows";
    } else if (_0x976b31.indexOf("android") !== -1) {
      _0x371bad = "Android";
    } else if (_0x976b31.indexOf("iphone") !== -1 || _0x976b31.indexOf("ipad") !== -1) {
      _0x371bad = "iOS";
    } else if (_0x976b31.indexOf("mac os x") !== -1) {
      _0x371bad = "Mac";
    } else {
      _0x371bad = "error";
    }
    chrome.runtime.sendMessage({
      id: _0x44eb48.id,
      request_type: "result_setting_record",
      version: chrome.runtime.getManifest().version,
      set_score: _0x44eb48.set_score,
      set_late: _0x44eb48.set_late / 1000,
      set_wrong_question: _0x44eb48["set_wrong_question.length"],
      set_run_unit: _0x44eb48.set_run_unit.join(),
      run_unit: _0x192d8,
      run_question_number: _0x44eb48.start_question_number,
      get_score: _0x44eb48.correct_answer_times + 1,
      incorrect_answer_times: _0x44eb48.incorrect_answer_times,
      duration: Math.round((Date.now() - _0x44eb48.start_time) / 1000),
      browser: _0x1148f8,
      os: _0x371bad,
      user_agent: _0x976b31,
      screen_width: screen.width,
      screen_height: screen.height
    }, _0x3aced6 => {
      console.debug(JSON.stringify(_0x3aced6));
      if (_0x44eb48.set_score > -2) {
        if ("set_score" in _0x44eb48) {
          chrome.storage.local.set({
            configured_score: _0x44eb48.set_score,
            configured_late: _0x44eb48.set_late,
            configured_rate: _0x44eb48.set_wrong_question.length,
            set_score: _0x44eb48.set_score - 25
          }, function () {
            if (ALLOW_PAGE_TRANSLATION) {
              document.getElementsByClassName("return-links _bottom")[0].children[0].click();
            }
          });
        } else {
          const _0x3090b0 = {
            configured_score: _0x44eb48.set_score,
            configured_late: _0x44eb48.set_late,
            configured_rate: _0x44eb48.set_wrong_question.length,
            set_score: 0
          };
          chrome.storage.local.set(_0x3090b0, function () {
            if (ALLOW_PAGE_TRANSLATION) {
              document.getElementsByClassName("return-links _bottom")[0].children[0].click();
            }
          });
          console.error("エラー");
        }
      }
    });
  }
});
