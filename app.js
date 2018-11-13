var accounts;
var account;
var current_timeout;
var current_bettimeout;
var current_drawtimeout;
var init_block;

window.addEventListener('load', function() {

    // Check if Web3 has been injected by the browser:
    if (typeof web3 !== 'undefined') {

        // You have a web3 browser! Continue below!
        console.log(" Web3");
        startApp(web3);

    } else {

        console.log(" No Web3");
        // Warn the user that they need to get a web3 browser
        // Or install MetaMask, maybe with a nice graphic.
    }

})


function startApp(web3) {

    web3 = new Web3(web3.currentProvider);
    abi = JSON.parse('[{"constant":false,"inputs":[{"name":"home_teams","type":"bytes32[]"},{"name":"away_teams","type":"bytes32[]"},{"name":"match_kickoff_times","type":"uint256[]"}],"name":"kickoff_lotto","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"max_ticket_price","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"predictions","type":"uint256[]"}],"name":"make_bet","outputs":[],"payable":true,"stateMutability":"payable","type":"function"},{"constant":true,"inputs":[{"name":"","type":"uint256"}],"name":"matches","outputs":[{"name":"home_team","type":"bytes32"},{"name":"away_team","type":"bytes32"},{"name":"time","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"amount","type":"uint256"}],"name":"transfer_amount","outputs":[],"payable":true,"stateMutability":"payable","type":"function"},{"constant":false,"inputs":[{"name":"match_results","type":"uint256[]"}],"name":"select_winners","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"organiser","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"}],"name":"player_addresses","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"min_ticket_price","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"winner","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"","type":"uint256"}],"name":"players","outputs":[{"name":"addr","type":"address"},{"name":"score","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[],"name":"shutdown","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"inputs":[],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":false,"name":"_drawer","type":"address"},{"indexed":false,"name":"winning_number","type":"uint256"},{"indexed":false,"name":"num_winners","type":"uint256"}],"name":"Drawn","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"_better","type":"address"},{"indexed":false,"name":"bet","type":"uint256"}],"name":"Betted","type":"event"}]'];
    LotteryContract = web3.eth.contract(abi);
    Lottery = LotteryContract.at('0x3689edcc3fcb23eddbbae038ec055b7d2e83afcd');

}

String.prototype.rjust = function(width, padding) {
    padding = padding || " ";
    padding = padding.substr(0, 1);
    if (this.length < width)
        return padding.repeat(width - this.length) + this;
    else
        return this;
}

function displayrise(val) {
    var cval = Math.round(val);
    var s = cval.toString();
    var res = "POOL ";
    var unit = " SZ";
    if (s.length > 10) {
        s = Math.round(val / 1000000).toString();
        unit = "ETH"
    }
    res += s.rjust(10, "0");
    res += unit;
    res = res.replace(/5/g, "S");

    display.setValue(res);
}

function timeout_display(current, target, step) {
    if (current <= target) {
        displayrise(current);
        current_timeout = setTimeout(timeout_display, 1, current + step, target, step);
    }
}

function betcd_display(current) {
    if (current > 0) {
        var words = "Betting's closed in " + humanizeDuration(current * 1000) + "!";
        $("#bet_cd").text(words);
        current_bettimeout = setTimeout(betcd_display, 1000, current - 1);
    } else {
        update_ticker();
    }
}

function drawcd_display(current) {
    if (current > 0) {
        var words = "Draw (Available in " + humanizeDuration(current * 1000) + ")";
        $("#draw_button").text(words);
        current_drawtimeout = setTimeout(drawcd_display, 1000, current - 1);
    } else {
        init_draw_button();
    }
}

function update_ticker() {

    Lottery.start_date.call(function(error, result) {
        if (error)
            console.log(error);
        else
            start_data = result;
    });

    Lottery.betting_period.call(function(error, result) {
        if (error)
            console.log(error);
        else
            betting_period = result;
    });

    Lottery.total_bets.call(function(error, result) {
        if (error)
            console.log(error);
        else {
            tbets = result;
            web3.eth.getBalance(Lottery.address, function(error, result) {
                if (error)
                    console.log(error);
                else {
                    tpool = result;
                    console.log(tpool);

                    var total = tpool / 1000000000000;
                    if (total > 0) {
                        var initial = total - 10000;
                        if (initial < 0) {
                            initial = 0;
                        }
                        if (current_timeout) {
                            clearTimeout(current_timeout);
                        }
                        timeout_display(initial, total, 1);
                    }
                    if (current_bettimeout) {
                        clearTimeout(current_bettimeout);
                    }
                    if (tbets == 0) {
                        $("#bet_cd").text("There are no tickets in the pool. Be the first!");
                        $('#guess_textfield').removeAttr("disabled");
                        $('#slide_01').removeAttr("disabled");
                        $('#pick_button').removeAttr("disabled");
                        $('#purchase_button').removeAttr("disabled");
                    } else {
                        var now = Math.round(new Date().getTime() / 1000);
                        var diff = now - start_date.toNumber();
                        var bperiod = betting_period.toNumber();
                        if (diff >= bperiod) {
                            $('#guess_textfield').prop("disabled", true);
                            $('#slide_01').prop("disabled", true);
                            $('#pick_button').prop("disabled", true);
                            $('#purchase_button').prop("disabled", true);
                            $("#bet_cd").text("Betting period is over! Please wait for the draw.");
                        } else {
                            $('#guess_textfield').removeAttr("disabled");
                            $('#slide_01').removeAttr("disabled");
                            $('#pick_button').removeAttr("disabled");
                            $('#purchase_button').removeAttr("disabled");
                            betcd_display(bperiod - diff);
                        }
                    }

                }
            });

        }
    });

}

function update_cost() {

    Lottery.ticket_price.call(function(error, result) {
        if (error)
            console.log(error)
        else {}
    });

}

function sync_guess(val) {
    if (isNaN(val)) {
        val = 0;
    }
    if (val > 10) {
        val = 10;
    }
    if (val < 0) {
        val = 0;
    }
    var s = "(2) Get Lucky With The Number " + val.toString() + "!";
    //  $('#purchase_button').text(s);
    //$('#guess_textfield').get(0).value = val.toString();
    //  $("#slide_01").get(0).MaterialSlider.change(val);
}

function init_slider() {
    $('#slide_01').on('input', function() {
        sync_guess(this.value);
    });

    $('#guess_textfield').keyup(function() {
        if ($('#guess_textfield').val() != "") {
            var val = parseInt($('#guess_textfield').val());
            sync_guess(val);
        }
    });
}

function init_draw_button() {

    web3.eth.getBalance(Lottery.address, function(error, result) {
        if (error)
            console.log(error);
        else if (result.toNumber() == 0) {
            $('#draw_button').prop("disabled", true);
            return;
        }
    });

    Lottery.start_date.call(function(error, result) {
        if (error)
            console.log(error);
        else {
            start_date = result;
            Lottery.betting_period.call(function(error, result) {
                if (error)
                    console.log(error);
                else {
                    betting_period = result;
                    Lottery.waiting_period.call(function(error, result) {
                        if (error)
                            console.log(error);
                        else {
                            waiting_period = result;
                            Lottery.total_bets.call(function(error, result) {
                                if (result)
                                    total_bets = result;



                                if (total_bets == 0) {
                                    $('#draw_button').prop("disabled", true);
                                    return null;
                                }
                                var now = Math.round(new Date().getTime() / 1000);
                                var diff = now - start_date.toNumber();
                                tperiod = betting_period.toNumber() + waiting_period.toNumber();
                                if (diff >= tperiod) {
                                    $('#draw_button').removeAttr("disabled");
                                    if (current_drawtimeout) {
                                        clearTimeout(current_drawtimeout);
                                    }
                                    $('#draw_button').text("Draw")
                                } else {
                                    var count = tperiod - diff
                                    drawcd_display(count);
                                }

                            });


                        }
                    });

                }
            });



        }
    });

}

function perform_drawing() {

    web3.eth.getBalance(Lottery.address, function(error, result) {
        if (result.toNumber() == 0) {
            show_toast("Sorry, you can't draw since there's nothing in the pool.");
            return;
        }
    });

    Lottery.draw.sendTransaction({ from: account, gas: 1000000 }, function(error, result) {
        show_toast("Thank you for drawing! \n The commission will be transferred to you shortly if you are the first to perform the draw.", 5000);
    });

}

function change_active_address(acc_change) {
    account = acc_change;
    $('#active_address').text(account.substring(2));

    show_toast('Active account switched to ' + account);
}

function show_toast(message, duration = 2000) {
    var snackbarContainer = document.querySelector('#demo-snackbar-example');
    var showSnackbarButton = document.querySelector('#demo-show-snackbar');
    var data = {
        message: message,
        timeout: duration,
    };
    snackbarContainer.MaterialSnackbar.showSnackbar(data);
}

function populate_addresses() {
    var address_container = $('#account_menu');
    for (var i in accounts) {
        var ta = '<li class="mdl-menu__item" onclick="change_active_address(\'' +
            accounts[i] + '\')">' + accounts[i].substring(2) + '</li>';
        address_container.append(ta);
    }
}

function update_bets(i) {

    Lottery.bets_lengths.call(i, function(error, result) {
        if (error) {
            console.log(error);
        }
        if (result) {
            $('#no_bets_' + i).text(result);
            if (i < 10) {
                update_bets(i + 1)
            }
        }
    });

}

function update_bets_amount(i) {

    Lottery.bets_amount.call(i, function(error, result) {
        if (error) {
            console.log(error);
        }
        if (result) {
            $('#bet_amount_' + i).text(result / 1000000000000000000);
            if (i < 10) {
                update_bets_amount(i + 1)
            }
        }
    });

}

$('#bet_form').submit(function(evt) {
    evt.preventDefault();
});

function perform_purchase() {
    guess = $('#bet_no').val();
    stake = $('#stake').val();
    bet_amount = $('#bet_amount').val();
    console.log(guess);
    console.log(stake);
    console.log(bet_amount);
    Lottery.ticket_price.call(function(error, result) {
        if (error) {
            console.log(error);
        } else {
            price = web3.toWei(bet_amount * stake);
            console.log(price);
            Lottery.make_bet.sendTransaction(guess, { from: account, value: price, gas: 1000000 }, function(error, result) {
                if (error)
                    console.log(error);
                else
                    console.log(result);
            });
        }
        console.log(result);
    });
    show_toast("May the odds be ever in your favour!");
    update_ticker();
}

function add_event_watchers() {
    Lottery.Drawn().watch(drawn_callback);
    Lottery.Betted().watch(betted_callback);
}

function drawn_callback(err, res) {
    if (res.blockNumber > init_block) {
        var msg = "Lottery has been drawn by " + res.args._drawer;
    } else {
        var msg = "Lottery was last drawn by " + res.args._drawer;
    }
    msg += ".\nWinning number was " + res.args.winning_number.toString();
    msg += " (" + res.args.num_winners + " winners)";

    show_toast(msg, 10000);
    init_draw_button();
    update_ticker();
    update_bets();
}

function betted_callback(err, res) {
    init_draw_button();
    update_ticker();
    update_bets(1);
    update_bets_amount(1);
}

function pick_for_me() {
    var random_guess = Math.floor((Math.random() * 101));
    sync_guess(random_guess);
}

window.onload = function() {
    web3.eth.getAccounts(function(err, accs) {
        if (err != null) {
            alert("There was an error fetching your accounts.");
            return;
        }

        if (accs.length == 0) {
            alert("Couldn't get any accounts! Make sure your Ethereum client is configured correctly.");
            return;
        }

        accounts = accs;
        account = accounts[0];
        web3.eth.getBlockNumber(function(error, result) {
            if (result)
                init_block = result;
        });

        populate_addresses();
        change_active_address(account);
        init_slider();
        init_draw_button();
        update_cost();
        update_ticker();
        add_event_watchers();
        pick_for_me();
        update_bets(1);
        update_bets_amount(1);
    });
}