// Incredibly hacky way to close the popover when something outside the popover
// is clicked, which is not currently supported by ngbootstrap.

// Using a service allowes us to register only one event listener on the document
// instead of using an event listner for every term tag, which really slowed down
// the page.


import { Injectable } from '@angular/core';
import { NgbPopover } from '@ng-bootstrap/ng-bootstrap';



@Injectable()
export class ClosePopoverService {
  // Currently-opened popover
  private popover: NgbPopover = null;

  // Ignore first click so we don't close a popover right when opening it.
  private active = false;

  // This is called when a new popover opens, to keep track of the currently-opened popover.
  registerPopover(popover: NgbPopover): void {
    this.active = false;
    this.popover = popover;
  }

  constructor() {
    window.addEventListener('click', (event) => {
      if (!this.active) {
        // Ignore the first click, which is detected when opening the popup.
        this.active = true;
      }
      else if (this.popover && this.popover.isOpen()) {

          // Check to see if the click was inside the popover.  If it was, don't close it.
          let cancelClose = false;
          let popoverWindows = document.getElementsByTagName('ngb-popover-window');
          for (let i = 0; i < popoverWindows.length; i++) {
            cancelClose = cancelClose || popoverWindows[i].contains(event.target as Node);
          }
          if (!cancelClose) {
            this.popover.close();
          }
      }
    })
  }
}
