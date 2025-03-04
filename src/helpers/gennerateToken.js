export function gennerateToken(){
    const characters = 
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuwxyz0123456789';

    const length = 20;
    let token = '';

    for(let i=0; i<length; i++){
        token += characters.charAt(Math.floor(Math.random() * characters.length));
    }

    return token;
}