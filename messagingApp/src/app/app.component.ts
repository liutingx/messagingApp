import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ChatMessage, ChatService } from './chat.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'messagingApp';

  text = 'Join'
  form: FormGroup

  messages: ChatMessage[] = []
  event$: Subscription

  constructor(private fb: FormBuilder, private chatSvc: ChatService){}

  ngOnInit() {
    this.form = this.fb.group({
      username: this.fb.control('', [Validators.required]),
      message: this.fb.control('', [Validators.required])
    })
  }

  ngOnDestroy() {
    //check if we are connected before unsubscribing
    if(null != this.event$){
      this.event$.unsubscribe()
      this.event$ = null
    }  
  }

  toggleConnection(){
    const name = this.form.get('username').value
    if(name){
      if(this.text == 'Join'){
      this.text = 'Leave'
      //const name = this.form.get('username').value
      console.log('user', name)
      this.chatSvc.join(name)
      //subscribe to incoming messages
      this.event$ = this.chatSvc.event.subscribe(chat => {
        //push it to the front of array
        this.messages.unshift(chat)
      })
    }
      else{
        this.text = 'Join'
        this.chatSvc.leave()
        this.event$.unsubscribe()
        this.event$ = null
      }
    }
    else{
      alert('Fill in your username')
    }
  }

  sendMessage(){
    const message = this.form.get('message').value
    this.chatSvc.sendMessage(message)
    this.form.get('message').reset()
    console.log('message', message)
  }

}
