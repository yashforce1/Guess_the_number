let randomnumber = parseInt(Math.random()*100 +1);


const guess_num = document.getElementById('number');
const submit = document.getElementById('submit_guess');

const count_r = document.getElementById('count_r');
const hint = document.getElementById('low_high');


//this section is made for previous guess(array)
let previous = document.getElementById('previous_guess');
let num = [];





function validate(check_value){
    if(isNaN(check_value) || check_value < 1 || check_value > 100){
        hint.innerText = "Please enter a number between 1 and 100";
        hint.style.color = "#ebb29e";
        guess_num.value = " "
        return false;
    }
    return true;
}// if the function is false then it will be stop

let  count = 10;

const check =() =>{
    submit.addEventListener("click",(event)=>{
        event.preventDefault();    /// this will help  not to refresh the page;

        const user = parseInt(guess_num.value);
        validate(user);

        // console.log("user guesses :",user);
        // console.log("random number :",randomnumber);
        
        if(!validate(user))return ;   


        if(user == randomnumber){
            hint.innerText="Congragulation You won the Game !"
            hint.style.color="#afd915";
            submit.disabled =true;
        }
        else if(user < randomnumber){
            hint.innerText=`The number is greater than ${user}`;
            hint.style.color="#ebb29e"
        }
        else {
            hint.innerText=`The number is smaller than ${user}`;
            hint.style.color="#ebb29e"
        }
        guess_num.value=" ";


        //this is for reducuing the count (guess remaining)
        count--;
        count_r.innerText=count;


        // if gussed wrong 10 times  ,, you need to restart the game
        if(count <= 0){
            hint.innerText=`Game Over! The number was ${randomnumber}`;
            hint.style.color="rgb(7, 2, 58)";
            submit.disabled =true;
        }


        //this where we creating array for previous guess.
        num.push(user);
        previous.innerText = `[ ${num} ]`;

        
    });

}
const restart = document.querySelector('#restart');


// here everything is reset.
restart.addEventListener('click',(event)=>{
    event.preventDefault();
    count = 10;
    randomnumber = parseInt(Math.random()*100 +1);    // creates new random number 
    submit.disabled = false;
    hint.innerText=" ";
    count_r.innerText =count;
    guess_num.value = " ";
    num = [];
    previous.innerText=" ";
})
check();