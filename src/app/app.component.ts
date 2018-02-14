import { Component } from '@angular/core';
import { IpfsService } from './ipfs/ipfs.service';
import { Observable } from "rxjs/Observable";
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'app';
  addresses: Observable<Array<string>>
  peers: Array<string>
  messages: Array<string>
  ipfs
  displayPeerList = false

  constructor(ipfs: IpfsService, private route: ActivatedRoute) {
    this.messages = []
    this.ipfs = ipfs
    this.route.queryParams.subscribe(params => {
      this.ipfs.ready().subscribe(() => {
        if (typeof params.peer === "string") {
          this.ipfs.connectPeer(params.peer);
        } else {
          for (let i in params.peer) {
            if (params.peer[i] != "") {
              try {
                this.ipfs.connectPeer(params.peer[i]);
              } catch (e) {
                console.log("Cannot connect to " + params.peer[i])
              }
            }
          }
        }
      })
    });
  }

  addPeer(peer) {
    this.ipfs.connectPeer(peer);
  }

  ngOnInit() {
    this.ipfs.ready().subscribe(() => {
      this.ipfs.sub("hello").subscribe(data => {
        this.messages.push(data.toString())
      });
      this.addresses = this.ipfs.addresses()
      this.peers = this.ipfs.peers();
    })
  }

  publish(message) {
    this.ipfs.pub("hello", message)
  }
}
