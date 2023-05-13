import {fromFetch} from '/node_modules/rxjs/fetch';
import {switchMap} from "/node_modules/rxjs/operators";
import {interval} from "/node_modules/rxjs";

const URI = 'https://penjat.codifi.cat'
const ACTIONS = {
    createGame: 'createGame', infoGame: 'infoGame', playGame: 'playGame'
}

const maincontainer = document.getElementById('maincontainer')
const registerGame = document.getElementById('registerGame');
const joinGame = document.getElementById('joinGame');
const switchGame = document.getElementById('switch');


switchGame.addEventListener('click', () => {
    resetForm();
})

joinGame.addEventListener('submit', (event) => {
    event.preventDefault();
    maincontainer.style.display = 'none';
    const gameName = document.getElementById('gamename').value;
    joinGame.style.display = 'none'
    checkCurrentGameStatus(gameName);
})

registerGame.addEventListener('submit', (event) => {
    event.preventDefault();
    maincontainer.style.display = 'none';
    const gameName = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    fromFetch(URI, {
        method: 'POST', body: JSON.stringify({
            action: ACTIONS.createGame, gameName: gameName, gamePassword: password
        }), selector: response => response.json()
    }).subscribe((res) => {
        registerGame.style.display = 'none'
        console.log(res)
        checkCurrentGameStatus(gameName)
    })
});


function guessWord(gameName, word, player) {
    console.log(gameName, word, player)
    fromFetch(URI, {
        method: 'POST', body: JSON.stringify({
            action: ACTIONS.playGame, gameName: gameName, word: word, player: player
        }), selector: response => response.json()
    }).subscribe((res) => {
        console.log('playGame', res)
        checkCurrentGameStatus(gameName)
    })
}

function checkCurrentGameStatus(gameName) {
    interval(1000).pipe(
        switchMap(() => {
            return fromFetch(URI, {
                method: 'POST',
                body: JSON.stringify({
                    action: ACTIONS.infoGame,
                    gameName: gameName,
                }),
                selector: response => response.json()
            })
        })
    ).subscribe((res) => {
        if (res.status !== 'OK') {
            resetForm();
            throw new Error('Esta partida no existe')
        } else {
            init(gameName, res)
        }
    })

}


function init(gameName, res) {
    maincontainer.style.display = 'block';
    console.log(res.gameInfo)

    const currentPlayer = res.player;
    // const currentLivesOfPlayer = res.gameInfo.livesP1 ? res.gameInfo.livesP2 : ''
    document.getElementById("letters").innerHTML = res.gameInfo.wordCompleted

    currentPlayer === 'P1' ? checkLives(res.gameInfo.livesP1) : checkLives(res.gameInfo.livesP2)

    /**
     * cambiar mensaje por quien está jugando + informacion
     * @type {HTMLElement}
     */
    // let buttonContinue = document.getElementById("btn_ok")
    // document.getElementById("info").style.display = "block";
    // document.getElementById("welcome").style.display = "block";
    //
    // buttonContinue.addEventListener("click", () => {
    //     document.getElementById("info").style.display = "none";
    //     document.getElementById("welcome").style.display = "none";
    // })
    //FIXME
    //BOTON NEW GAME, inicia una nueva partida
    let newGame = document.getElementById("new_game")
    newGame.innerHTML = `Turno de ${currentPlayer}`
    newGame.addEventListener("click", () => {
        location.reload()
    })


    document.addEventListener("keypress", (keyPress) => {
        let key = keyPress.key

        const validar = /^[a-zA-Z]/
        if (validar.test(key)) {
            guessWord(gameName, key, currentPlayer)
        }
    })


    function checkLives(vidas) {
        document.getElementById("lives").innerHTML = `${vidas} LIVES LEFT`;
        const image = document.getElementById("monster");
        if (vidas < 0 ? image.src = `img/monster${5}.png` : image.src = `img/monster${vidas}.png`)

            if (vidas < 1) {
                document.getElementById("lives").innerHTML = `${0} LIVES LEFT`;
                document.getElementById("info").style.display = "block"
                document.getElementById("game_fail").style.display = "block"

                buttonContinue.addEventListener("click", () => {
                    document.getElementById("info").style.display = "none";
                    document.getElementById("game_fail").style.display = "none";
                    setTimeout(function () {
                        window.location.reload();
                    }, 2000);
                })
            }
    }

    /**
     * mensaje cuando gana
     */
    function gameEnd() {

        document.getElementById("info").style.display = "block"
        document.getElementById("game_success").style.display = "block"

        buttonContinue.addEventListener("click", () => {
            document.getElementById("info").style.display = "none";
            document.getElementById("game_fail").style.display = "none";
            setTimeout(function () {
                window.location.reload();
            }, 2000);
        })
    }
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