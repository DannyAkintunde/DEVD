function parseButtons(button) {
    let out = [];
    button.forEach(item => {
        let but = {};
        if (item.type == 1) but.name = "quick_reply";
        else if (item.type == 2) but.name = "";
    });
}
