import { EventEmitter } from "node:events";
import { sendEmail } from "./sendEmail.js";

export const emailEventName = {
  signUp : "signUp"
}

Object.freeze(emailEventName)


export let emailEvent = new EventEmitter()


emailEvent.on(emailEventName.signUp , async(data)=>{
  try{
    await sendEmail(data)
  }catch(e){
    console.log(e)
  }
})