function onLoad() {
    Array.prototype.forEach.call(document.getElementsByClassName('code'), function(element) {
        element.addEventListener('mouseover', onMouseOver, false);
        element.addEventListener('mousemove', onMouseMove, false);
        element.addEventListener('mouseout', onMouseOut, false);
    });
}

function onMouseOver(event) {
    var popup = document.getElementById('popup');
    addMutations(popup, event.target);
    setPopupPosition(popup, event);
    popup.classList.add("show");
}

function onMouseMove(event) {
    setPopupPosition(document.getElementById('popup'), event);
}

function onMouseOut() {
    document.getElementById('popup').classList.remove('show');
}

function addMutations(popup, target) {
    var mutationEl;

    Array.prototype.forEach.call(target.classList, function(_class) {
        if (_class.indexOf('mutation_') > -1) {
            mutationEl = document.getElementById(_class);
            if (Array.prototype.indexOf.call(mutationEl.classList, 'killed') > -1) {
                popup.classList.add('killed');
                popup.classList.remove('survived');
            } else {
                popup.classList.add('survived');
                popup.classList.remove('killed');
            }
            popup.classList.add(mutationEl.classList);
            popup.innerHTML = mutationEl.innerHTML;
        }
    });
}

function setPopupPosition(popup, event) {
    var top = event.clientY,
        left = event.clientX + 10;

    popup.setAttribute('style', 'top:' + top + 'px;left:' + left + 'px;');
}
