import { Component } from '@angular/core';
import { IpfsService } from './ipfs/ipfs.service';
import { Observable } from "rxjs/Observable";
import { ActivatedRoute } from '@angular/router';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import 'rxjs/add/operator/catch';

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

  image: SafeUrl

  constructor(ipfs: IpfsService, private route: ActivatedRoute, private sanitizer: DomSanitizer) {
    this.messages = []
    this.peers = []
    this.ipfs = ipfs
    this.route.queryParams.subscribe(params => {
      this.ipfs.ready().subscribe(() => {
        if (typeof params.peer === "string" && params.peer !== "") {
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
      this.ipfs.peers().subscribe(peer => {
        this.peers.push(peer.id._idB58String)
      })
      this.addresses = this.ipfs.addresses()
      //this.getFile("QmQ2r6iMNpky5f1m4cnm3Yqw8VSvjuKpTcK1X7dBR1LkJF")
    })
  }

  publish(message) {
    this.ipfs.pub("hello", message)
  }

  getFile(hash) {
    this.image = this.sanitizer.bypassSecurityTrustUrl("https://icons8.com/preloaders/preloaders/4/Fading%20balls.gif")
    this.ipfs.get(hash).subscribe(
      files => {
        files.forEach((file) => {
          if(file.content){
            var myArray = file.content;
            var blob = new Blob([myArray], {'type': 'image/png'});
            this.image = this.sanitizer.bypassSecurityTrustUrl(URL.createObjectURL(blob));
          }
        })
      }, 
      err => {
        this.image = false
      }
    )
  }
}
