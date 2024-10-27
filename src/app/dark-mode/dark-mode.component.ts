import {AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {NgClass, NgIf} from '@angular/common';
import {MusicService} from '../../services/music.service';
import {HttpClientModule} from '@angular/common/http';

@Component({
  selector: 'app-dark-mode',
  standalone: true,
  imports: [
    NgIf,
    HttpClientModule,
    NgClass
  ],
  providers: [MusicService],
  templateUrl: './dark-mode.component.html',
  styleUrl: './dark-mode.component.scss'
})
export class DarkModeComponent implements OnInit,OnDestroy,AfterViewInit{
  isPlayerListExpanded = false;
  musicList:any = [];
  palyingSong:any = null;
  currentAudio: HTMLAudioElement | null = null; // Reference to the current Audio instance
  isPlaying = false;
  songIndex = 0;
  progressPercentage = 0;




  constructor(private musicService:MusicService) {
  }

  ngOnInit() {
    this.musicService.getSongs().subscribe((data:any) => {
      this.musicList = data
    });
    //this.test()
  }


  togglePlayerList() {
    this.isPlayerListExpanded = !this.isPlayerListExpanded;
  }

  updateProgress = () => {
    if (this.currentAudio) {
      const progress = (this.currentAudio.currentTime / this.currentAudio.duration) * 100;
      this.progressPercentage = Math.round(progress);

      // Update the inner_slider_bar width
      const panel = document.getElementsByClassName('inner_slider_bar');
      if (panel[0]) {
        (panel[0] as HTMLElement).style.width = `${this.progressPercentage}%`;
      }
    }
  };

  playSong(music: any) {
    // Stop the currently playing audio if there is one
    if (this.currentAudio) {
      this.currentAudio.pause(); // Stop the current audio
      this.currentAudio.currentTime = 0; // Reset the playback position to the start
      this.currentAudio.removeEventListener('timeupdate', this.updateProgress);
    }

    // Set the new playing song
    this.palyingSong = music;

    this.musicService.getSingleSong(music.fileName).subscribe(
      (audioBlob) => {
        console.log('Fetched audio:', audioBlob);
        const audioUrl = URL.createObjectURL(audioBlob);
        this.currentAudio = new Audio(audioUrl); // Create a new Audio instance

        this.currentAudio.addEventListener('timeupdate', this.updateProgress);

        // Add ended event listener to handle song completion
        this.currentAudio.addEventListener('ended', () => {
          this.isPlaying = false;
          this.progressPercentage = 0;
          this.nextSong();
        });

        this.isPlaying = true
        this.currentAudio.play(); // Play the new audio
      },
      (error) => {
        console.error('Error fetching audio:', error);
      }
    );
  }

  playButton() {
    if(!this.currentAudio) {
      this.playSong(this.musicList[this.songIndex]);
    }
    if(this.currentAudio?.paused) {
      this.isPlaying = true
      this.currentAudio?.play();
    } else {
      this.isPlaying = false
      this.currentAudio?.pause();
    }
  }

  nextSong() {
    if(this.songIndex >= this.musicList.length - 1) {
      return
    }
    this.songIndex++;
    this.playSong(this.musicList[this.songIndex]);
  }

  prevSong() {
    if(this.songIndex <= 0) {
      return
    }
    this.songIndex--;
    this.playSong(this.musicList[this.songIndex]);
  }

  toggleMute() {
    if(this.currentAudio) {
      this.currentAudio.muted = !this.currentAudio.muted;
    }
  }


  test() {
    const panel = document.getElementsByClassName('inner_slider_bar');
    const panelElement = panel[0] as HTMLElement; // Type assertion to HTMLElement
    let x = 0;
    setInterval(() => {
      x = x + 5;
      if (panelElement) {
        panelElement.style.width = x + '%'; // Now you can access the style property
      }
    }, 500);
  }

  seekTo(event: MouseEvent) {
    if (this.currentAudio) {
      const progressBar = event.currentTarget as HTMLElement;
      const rect = progressBar.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const width = rect.width;
      const percentage = x / width;

      this.currentAudio.currentTime = percentage * this.currentAudio.duration;
    }
  }






  @ViewChild('knob') knobElement!: ElementRef;
  @ViewChild('slider') sliderElement!: ElementRef;

  private isDragging = false;
  private knobHeight = 440;
  private currentVolume = 1; // Start with full volume

  ngAfterViewInit() {
    this.initializeVolumeSlider();
  }

  private initializeVolumeSlider() {
    const knob = this.knobElement.nativeElement;
    const slider = this.sliderElement.nativeElement;

    // Set initial knob position to top (0px = top position)
    knob.style.top = '0px';

    // Set initial volume to maximum
    if (this.currentAudio) {
      this.currentAudio.volume = 1;
    }

    knob.addEventListener('mousedown', (e: MouseEvent) => {
      this.isDragging = true;
      knob.classList.add('active');
      document.addEventListener('mousemove', this.handleDrag);
      document.addEventListener('mouseup', this.handleMouseUp);
      e.preventDefault();
    });
  }

  private handleDrag = (e: MouseEvent) => {
    if (!this.isDragging) return;

    const knob = this.knobElement.nativeElement;
    const slider = this.sliderElement.nativeElement;
    const sliderRect = slider.getBoundingClientRect();

    // Calculate new position
    let newY = e.clientY - sliderRect.top - 17; // Adjust for knob height/2

    // Constrain within slider bounds (adjusted for design)
    newY = Math.max(0, Math.min(newY, this.knobHeight));

    // Update knob position
    knob.style.top = `${newY}px`;

    // Calculate and set volume
    const volume = Math.abs(newY / this.knobHeight - 1);
    this.setVolume(volume);
  };

  private handleMouseUp = () => {
    this.isDragging = false;
    const knob = this.knobElement.nativeElement;
    knob.classList.remove('active');

    document.removeEventListener('mousemove', this.handleDrag);
    document.removeEventListener('mouseup', this.handleMouseUp);
  };

  private setVolume(volume: number) {
    if (this.currentAudio) {
      this.currentAudio.volume = volume > 0.01 ? volume : 0;
      this.currentVolume = this.currentAudio.volume;
    }
  }

  ngOnDestroy() {
    // Clean up audio and event listeners when component is destroyed
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.removeEventListener('timeupdate', this.updateProgress);
      this.currentAudio = null;
    }

    document.removeEventListener('mousemove', this.handleDrag);
    document.removeEventListener('mouseup', this.handleMouseUp);
  }

}
