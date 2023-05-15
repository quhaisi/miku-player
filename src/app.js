import React, { useState, useRef, useEffect, useMemo } from 'react';
import PlayBar from './components/play_bar'

export default function app () {

  const playHistory = []

  const [volume, setVolume] = useState(20)
  const [playType, setPlayType] = useState(0)
  const playTypes = [
    {
      code: 0,
      desc: '顺序播放'
    },
    {
      code: 1,
      desc: '列表循环'
    },
    {
      code: 2,
      desc: '随机播放'
    },
    {
      code: 3,
      desc: '单曲循环'
    },
  ]
  const [current, setCurrent] = useState('')
  const [sourceMusicList, setSourceMusicList] = useState([])
  const [searchText, setSearchText] = useState('')
  const audioRef = useRef(null)
  const musicList = useMemo(() => {
    return sourceMusicList.filter(music => music.includes(searchText))
  }, [sourceMusicList, searchText])

  useEffect(async () => {
    // 获取缓存的播放方式
    setPlayType(localStorage.getItem('playType') || 0)
    // 直接获取上次选择的路径下的歌曲
    if(localStorage.getItem('defaultPath')) {
      const result = await window.electronAPI.getDefaultMusicList(localStorage.getItem('defaultPath'))
      setSourceMusicList(Array.isArray(result) ? result : [])
    }
  }, [])

  useEffect(() => {
    window.electronAPI.handleMusicOperation((event, operation) => {
      switch (operation) {
        case 'play':
          playList()
          break;
        case 'pause':
          pause()
          break;
        case 'next':
          nextMusic()
          break;
        default:
          break;
      }
    })
    return () => {
      window.electronAPI.rmHandleMusicOperation()
    }
  }, [musicList])


  useEffect(() => {
    audioRef.current.addEventListener('ended', nextMusic)
    return () => {
      audioRef.current.removeEventListener('ended', nextMusic)
    }
  }, [sourceMusicList])

  const getMusicList = async () => {
     const resultString = await window.electronAPI.getMusicList()
     const {canceled, musicList, path} = JSON.parse(resultString)
    if(!canceled) {
      localStorage.setItem('defaultPath', path)
      setSourceMusicList(musicList)
    }
  }

  useEffect(() => {
    audioRef.current.volume = volume/100
  }, [volume])

  const playMusic = music => {
    play(music)
  }

  const playList = () => {
    if(playType == 0) {
      play(musicList[0])
    } else {
      play(sourceMusicList[Math.floor(Math.random()*sourceMusicList.length)])
    }
  }

  const pause = () => {
    audioRef.current.pause()
  }

  const nextMusic = () => {
    play(sourceMusicList[Math.floor(Math.random()*sourceMusicList.length)])
  }

  const play = path => {
    audioRef.current.src = path
    setCurrent(path.substring(path.lastIndexOf('/')+1))
    audioRef.current.play()
  }

  const palyTypeHandler = e => {
    const playType = e.target.value
    localStorage.setItem('playType', playType)
    setPlayType(playType)
  }

  return (
    <div>
      <PlayBar />
      <div>
        正在播放：{current}
        <br/>
        <audio ref={audioRef} controls src=""></audio> 
      </div>
      <button onClick={() => getMusicList()}>获取音乐列表</button>
      <button onClick={playList}>播放列表</button>
      <button onClick={nextMusic}>下一首</button>
      <input type="number" min="0" max="100" step="5" value={volume} onInput={e => setVolume(e.target.value)} />
      <select value={playType} onChange={palyTypeHandler}>
        { playTypes.map(type => <option value={type.code}>{type.desc}</option>)}
      </select>
      <br/>
      <input type="text" value={searchText} onInput={e => setSearchText(e.target.value)} />
      <ul>
        {musicList.map(music => <li onClick={() => playMusic(music)}>{music.substring(music.lastIndexOf('/')+1)}</li>)}
      </ul>
    </div>
  )
}