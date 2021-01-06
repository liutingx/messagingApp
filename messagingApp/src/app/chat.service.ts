import { HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Subject } from "rxjs";

export interface ChatMessage {
    from: string,
    message: string,
    timestamp: string
}

@Injectable()
export class ChatService {

    private sock: WebSocket

    event = new Subject<ChatMessage>()

    join(name: string){
        const params = new HttpParams().set('name', name)
        const url = `ws://localhost:3000/chat?${params.toString()}`
        console.log('url', url)
        
        this.sock = new WebSocket(url)
        //handle incoming message
        this.sock.onmessage = (payload: MessageEvent) => {
            //parse the string to ChatMessage
            const chat = JSON.parse(payload.data) as ChatMessage
            this.event.next(chat)
        }
        //handle accidental socket error (connection ended by other party)
        this.sock.onclose = (() => {
            console.log('server close')
            if(this.sock != null){
                console.log('client close')
                this.sock.close()
                this.sock = null
            }
        }).bind(this)
    }

    //leaving connection on our own
    leave(){
        if(this.sock != null){
            console.log('client leave')
            this.sock.close()
            this.sock = null
        }
    }

    sendMessage(msg){
        this.sock.send(msg)
    }

}