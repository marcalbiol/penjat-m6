import {fromFetch} from '/node_modules/rxjs/fetch';
import {switchMap} from '/node_modules/rxjs/operators';
import {catchError, interval, throwError} from '/node_modules/rxjs';

const URI = 'https://penjat.codifi.cat'
const ACTIONS = {
    createGame: 'createGame', infoGame: 'infoGame', playGame: 'playGame'
}
const whoIs = {
    P1: 'P1', P2: 'P2'
}

const maincontainer = document.getElementById('maincontainer')
const registerGame = document.getElementById('registerGame');
const joinGame = document.getElementById('joinGame');
const switchGame = document.getElementById('switch');
const player = document.getElementById('currentPlayer')
const toast = document.getElementById('toast-container')

switchGame.addEventListener('click', () => resetForm())

joinGame.addEventListener('submit', (event) => {
    event.preventDefault();
    maincontainer.style.display = 'none';
    const gameName = document.getElementById('gamename').value;
    joinGame.style.display = 'none'
    player.innerText = whoIs.P2
    checkCurrentGameStatus(gameName, whoIs.P2);

})

registerGame.addEventListener('submit', (event) => {
    event.preventDefault();
    maincontainer.style.display = 'none';
    const gameName = document.getElementById('username').value;
    const password = document.getElementById('password').value
    fromFetch(URI, {
        method: 'POST', body: JSON.stringify({
            action: ACTIONS.createGame, gameName: gameName, gamePassword: password
        }), selector: response => response.json()
    }).subscribe((res) => {
        registerGame.style.display = 'none'
        player.innerText = whoIs.P1
        checkCurrentGameStatus(gameName, whoIs.P1)
    })
});


function checkCurrentGameStatus(gameName, whoIs) {
    let currentPlayer;

    interval(1000).pipe(switchMap(() => {
        return fromFetch(URI, {
            method: 'POST',
            body: JSON.stringify({action: ACTIONS.infoGame, gameName: gameName}),
            selector: response => response.json()
        }).pipe(catchError((error) => {
            resetForm();
            return throwError(new Error('Esta partida no existe'));
        }));
    })).subscribe((res) => {
        maincontainer.style.display = 'block';
        currentPlayer = res.player;
        document.getElementById("letters").innerHTML = res.gameInfo.wordCompleted
        currentPlayer === 'P1' ? checkLives(res.gameInfo.livesP1) : checkLives(res.gameInfo.livesP2)
        userInfo();

        if (currentPlayer !== whoIs) {
            toast.style.display = 'block'
        } else {
            toast.style.display = 'none'
            whoCanPlay();
        }
    });

    function whoCanPlay() {
        function onKeyDown(event) {
            let key = event.key
            console.log(key)
            const validar = /^[a-zA-Z]/
            if (validar.test(key)) {
                guessWord(gameName, key, currentPlayer)
                document.removeEventListener('keydown', onKeyDown);
            }
        }

        document.addEventListener('keydown', onKeyDown);
    }

    function userInfo() {
        let newGame = document.getElementById("new_game")
        newGame.innerHTML = `Turno de ${currentPlayer}`

        newGame.addEventListener("click", () => {
            location.reload()
        })
    }
}


    function checkLives(vidas) {
        let monster = 5 - Math.min(5, vidas);

        document.getElementById("lives").innerHTML = `${vidas} LIVES LEFT`;
        const image = document.getElementById("monster");
        if (vidas < 0 ? image.src = `img/monster${5}.png` : image.src = `img/monster${monster}.png`)

            if (vidas < 1) {
                document.getElementById("lives").innerHTML = `${0} LIVES LEFT`;
                document.getElementById("info").style.display = "block"
                document.getElementById("game_fail").style.display = "block"

                /*   buttonContinue.addEventListener("click", () => {
                       document.getElementById("info").style.display = "none";
                       document.getElementById("game_fail").style.display = "none";
                       setTimeout(function () {
                           window.location.reload();
                       }, 2000);
                   })*/
            }
    }


function guessWord(gameName, word, player) {
    fromFetch(URI, {
        method: 'POST', body: JSON.stringify({
            action: ACTIONS.playGame, gameName: gameName, word: word, player: player
        }), selector: response => response.json()
    }).subscribe()
}

/**
 * mensaje cuando gana
 */
function gameEnd() {
    document.getElementById("info").style.display = "block"
    document.getElementById("game_success").style.display = "block"
    /* buttonContinue.addEventListener("click", () => {
         document.getElementById("info").style.display = "none";
         document.getElementById("game_fail").style.display = "none";
         setTimeout(function () {
             window.location.reload();
         }, 2000);
     })*/
}

function resetForm() {
    if (registerGame.style.display === 'none') {
        registerGame.style.display = 'block';
        joinGame.style.display = 'none';
        switchGame.innerText = 'Unirse a partida';
    } else {
        registerGame.style.display = 'none';
        joinGame.style.display = 'block';
        switchGame.innerText = 'Crear partida';
    }
}