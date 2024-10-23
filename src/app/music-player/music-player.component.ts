import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';

@Component({
  selector: 'app-music-player',
  templateUrl: './music-player.component.html',
  styleUrls: ['./music-player.component.scss'],
  standalone: true
})
export class MusicPlayerComponent implements OnInit {
  @ViewChild('playerTrack') playerTrack!: ElementRef;
  @ViewChild('bgArtwork') bgArtwork!: ElementRef;
  @ViewChild('albumName') albumName!: ElementRef;
  @ViewChild('trackName') trackName!: ElementRef;
  @ViewChild('albumArt') albumArt!: ElementRef;
  @ViewChild('sArea') sArea!: ElementRef;
  @ViewChild('seekBar') seekBar!: ElementRef;
  @ViewChild('trackTime') trackTime!: ElementRef;
  @ViewChild('insTime') insTime!: ElementRef;
  @ViewChild('sHover') sHover!: ElementRef;
  @ViewChild('playPauseButton') playPauseButton!: ElementRef;
  @ViewChild('tProgress') tProgress!: ElementRef;
  @ViewChild('tTime') tTime!: ElementRef;
  @ViewChild('playPreviousTrackButton') playPreviousTrackButton!: ElementRef;
  @ViewChild('playNextTrackButton') playNextTrackButton!: ElementRef;

  audio!: HTMLAudioElement;
  currIndex: number = -1;
  albums: string[] = ["Dawn", "Me & You", "Electro Boy", "Home", "Proxy (Original Mix)"];
  trackNames: string[] = ["Skylike - Dawn", "Alex Skrindo - Me & You", "Kaaze - Electro Boy", "Jordan Schor - Home", "Martin Garrix - Proxy"];
  albumArtworks: string[] = ["_1", "_2", "_3", "_4", "_5"];
  trackUrl: string[] = [
    "https://www.youtube.com/watch?v=xoWxv2yZXLQ&list=PLWL923jZIGrtOTDYPnk7wYo931GIS2-CD",
    "https://raw.githubusercontent.com/himalayasingh/music-player-1/master/music/1.mp3",
    "https://raw.githubusercontent.com/himalayasingh/music-player-1/master/music/3.mp3",
    "https://raw.githubusercontent.com/himalayasingh/music-player-1/master/music/4.mp3",
    "https://raw.githubusercontent.com/himalayasingh/music-player-1/master/music/5.mp3"
  ];
  buffInterval: any;
  tFlag: boolean = false;
  nTime: number = 0;
  bTime: number = 0;
  seekT: number = 0;
  ngOnInit() {
    this.initPlayer();
  }

  playPause() {
    setTimeout(() => {
      if (this.audio.paused) {
        this.playerTrack.nativeElement.classList.add('active');
        this.albumArt.nativeElement.classList.add('active');
        this.checkBuffering();
        this.playPauseButton.nativeElement.querySelector('i').className = 'fas fa-pause';
        this.audio.play();
      } else {
        this.playerTrack.nativeElement.classList.remove('active');
        this.albumArt.nativeElement.classList.remove('active');
        clearInterval(this.buffInterval);
        this.albumArt.nativeElement.classList.remove('buffering');
        this.playPauseButton.nativeElement.querySelector('i').className = 'fas fa-play';
        this.audio.pause();
      }
    }, 300);
  }

  showHover(event: MouseEvent) {
    const seekBarPos = this.sArea.nativeElement.getBoundingClientRect();
    const seekT = event.clientX - seekBarPos.left;
    const seekLoc = this.audio.duration * (seekT / this.sArea.nativeElement.offsetWidth);

    this.sHover.nativeElement.style.width = `${seekT}px`;

    let cM = seekLoc / 60;
    let ctMinutes = Math.floor(cM);
    let ctSeconds = Math.floor(seekLoc - ctMinutes * 60);

    if (ctMinutes < 0 || ctSeconds < 0) return;

    if (ctMinutes < 10) ctMinutes = "0" + ctMinutes as unknown as number;
    if (ctSeconds < 10) ctSeconds = "0" + ctSeconds as unknown as number;

    if (isNaN(ctMinutes) || isNaN(ctSeconds)) this.insTime.nativeElement.textContent = "--:--";
    else this.insTime.nativeElement.textContent = `${ctMinutes}:${ctSeconds}`;

    this.insTime.nativeElement.style.left = `${seekT}px`;
    this.insTime.nativeElement.style.marginLeft = "-21px";
    this.insTime.nativeElement.style.display = 'block';
  }

  hideHover() {
    this.sHover.nativeElement.style.width = '0px';
    this.insTime.nativeElement.textContent = "00:00";
    this.insTime.nativeElement.style.left = '0px';
    this.insTime.nativeElement.style.marginLeft = '0px';
    this.insTime.nativeElement.style.display = 'none';
  }

  playFromClickedPos() {
    const seekLoc = this.audio.duration * (this.seekT / this.sArea.nativeElement.offsetWidth);
    this.audio.currentTime = seekLoc;
    this.seekBar.nativeElement.style.width = `${this.seekT}px`;
    this.hideHover();
  }

  updateCurrTime() {
    this.nTime = new Date().getTime();

    if (!this.tFlag) {
      this.tFlag = true;
      this.trackTime.nativeElement.classList.add('active');
    }

    let curMinutes = Math.floor(this.audio.currentTime / 60);
    let curSeconds = Math.floor(this.audio.currentTime - curMinutes * 60);

    let durMinutes = Math.floor(this.audio.duration / 60);
    let durSeconds = Math.floor(this.audio.duration - durMinutes * 60);

    let playProgress = (this.audio.currentTime / this.audio.duration) * 100;
    if (curMinutes < 10) curMinutes = "0" + curMinutes as unknown as number;
    if (curSeconds < 10) curSeconds = "0" + curSeconds as unknown as number;
    if (durMinutes < 10) durMinutes = "0" + durMinutes as unknown as number;
    if (durSeconds < 10) durSeconds = "0" + durSeconds as unknown as number;
    if (durSeconds < 10) durSeconds = "0" + durSeconds as unknown as number;

    if (isNaN(curMinutes) || isNaN(curSeconds)) this.tProgress.nativeElement.textContent = "00:00";
    else this.tProgress.nativeElement.textContent = `${curMinutes}:${curSeconds}`;

    if (isNaN(durMinutes) || isNaN(durSeconds)) this.tTime.nativeElement.textContent = "00:00";
    else this.tTime.nativeElement.textContent = `${durMinutes}:${durSeconds}`;

    if (isNaN(curMinutes) || isNaN(curSeconds) || isNaN(durMinutes) || isNaN(durSeconds)) {
      this.trackTime.nativeElement.classList.remove('active');
    } else {
      this.trackTime.nativeElement.classList.add('active');
    }

    this.seekBar.nativeElement.style.width = `${playProgress}%`;

    if (playProgress == 100) {
      this.playPauseButton.nativeElement.querySelector('i').className = 'fa fa-play';
      this.seekBar.nativeElement.style.width = '0px';
      this.tProgress.nativeElement.textContent = "00:00";
      this.albumArt.nativeElement.classList.remove('buffering');
      this.albumArt.nativeElement.classList.remove('active');
      clearInterval(this.buffInterval);
    }
  }

  checkBuffering() {
    clearInterval(this.buffInterval);
    this.buffInterval = setInterval(() => {
      if (this.nTime == 0 || this.bTime - this.nTime > 1000) {
        this.albumArt.nativeElement.classList.add('buffering');
      } else {
        this.albumArt.nativeElement.classList.remove('buffering');
      }

      this.bTime = new Date().getTime();
    }, 100);
  }

  selectTrack(flag: number) {
    if (flag == 0 || flag == 1) ++this.currIndex;
    else --this.currIndex;

    if (this.currIndex > -1 && this.currIndex < this.albumArtworks.length) {
      if (flag == 0) this.playPauseButton.nativeElement.querySelector('i').className = 'fa fa-play';
      else {
        this.albumArt.nativeElement.classList.remove('buffering');
        this.playPauseButton.nativeElement.querySelector('i').className = 'fa fa-pause';
      }

      this.seekBar.nativeElement.style.width = '0px';
      this.trackTime.nativeElement.classList.remove('active');
      this.tProgress.nativeElement.textContent = "00:00";
      this.tTime.nativeElement.textContent = "00:00";

      const currAlbum = this.albums[this.currIndex];
      const currTrackName = this.trackNames[this.currIndex];
      const currArtwork = this.albumArtworks[this.currIndex];

      this.audio.src = this.trackUrl[this.currIndex];

      this.nTime = 0;
      this.bTime = new Date().getTime();

      if (flag != 0) {
        this.audio.play();
        this.playerTrack.nativeElement.classList.add('active');
        this.albumArt.nativeElement.classList.add('active');

        clearInterval(this.buffInterval);
        this.checkBuffering();
      }

      this.albumName.nativeElement.textContent = currAlbum;
      this.trackName.nativeElement.textContent = currTrackName;
      this.albumArt.nativeElement.querySelector('img.active').classList.remove('active');
      const artworkElement = document.getElementById(currArtwork);
      if (artworkElement) {
        artworkElement.classList.add('active');
        const bgArtworkUrl = artworkElement.getAttribute('src');
        if (bgArtworkUrl) {
          this.bgArtwork.nativeElement.style.backgroundImage = `url(${bgArtworkUrl})`;
        }
      }
      // this.bgArtwork.nativeElement.style.backgroundImage = `url(${bgArtworkUrl})`;
    } else {
      if (flag == 0 || flag == 1) --this.currIndex;
      else ++this.currIndex;
    }
  }

  initPlayer() {
    this.audio = new Audio();
    this.selectTrack(0);
    this.audio.loop = false;

    this.playPauseButton.nativeElement.addEventListener('click', () => this.playPause());
    this.sArea.nativeElement.addEventListener('mousemove', (event: MouseEvent) => this.showHover(event));
    this.sArea.nativeElement.addEventListener('mouseout', () => this.hideHover());
    this.sArea.nativeElement.addEventListener('click', () => this.playFromClickedPos());
    this.audio.addEventListener('timeupdate', () => this.updateCurrTime());
    this.playPreviousTrackButton.nativeElement.addEventListener('click', () => this.selectTrack(-1));
    this.playNextTrackButton.nativeElement.addEventListener('click', () => this.selectTrack(1));
  }
}