import { Injectable } from '@angular/core';
import * as IPFS from 'ipfs';
import { Observable } from "rxjs/Observable";
import 'rxjs/add/observable/of';

@Injectable()
export class IpfsService {
  node: IPFS
  
  constructor() {
    this.node = new IPFS({
      repo: String(Math.random() + Date.now()),
      EXPERIMENTAL: {
        pubsub: true
      },
      config: {
        Addresses: {
          Swarm: [
            '/dns4/ws-star.discovery.libp2p.io/tcp/443/wss/p2p-websocket-star'
          ]
        }
      }
    })
  }

  ready() {
    return Observable.create(observer => {
      this.node.on('ready', () => {
        observer.next();
        observer.complete();
      })
    })
  }

  sub(arg) {
    return Observable.create(observer => {
      this.node.pubsub.subscribe(arg, { discover: true }, (msg) => {
        observer.next(msg.data);
      })
    });
  }

  pub(arg, msg) {
    this.node.pubsub.publish(arg, new this.node.types.Buffer(msg))
  }

  addresses(): Observable<Array<string>> {
    return Observable.create(observer => {
      this.node.id((err, identity) => {
        if (err) {
          throw err
        }
        observer.next(identity.addresses)
        observer.complete();
      })
    })
  }

  connectPeer(peer) {
    this.node.swarm.connect(peer, (err) => {
      if (err) {
        console.log("Cannot connect to " + peer)
        return;
      }
    })
  }

  peers(){
    return Observable.create(observer => {
      this.node._libp2pNode.on('peer:connect', peer => {
        observer.next(peer);
      })
    });
  }

}
