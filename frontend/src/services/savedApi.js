import api from './api'

const authHeader = () => {
  const token = localStorage.getItem('smarttube_token')
  return { Authorization: `Bearer ${token}` }
}

export const saveVideo = async (video) => {
  const res = await api.post('/saved', {
    video_id: video.video_id,
    title: video.title,
    channel: video.channel,
    views: video.views,
    duration: video.duration,
    thumbnail_url: video.thumbnail_url,
    score: video.score,
    label: video.label,
  }, { headers: authHeader() })
  return res.data
}

export const unsaveVideo = async (videoId) => {
  const res = await api.delete(`/saved/${videoId}`, { headers: authHeader() })
  return res.data
}

export const getSavedVideos = async () => {
  const res = await api.get('/saved', { headers: authHeader() })
  return res.data
}

export const checkSaved = async (videoId) => {
  const res = await api.get(`/saved/check/${videoId}`, { headers: authHeader() })
  return res.data
}
