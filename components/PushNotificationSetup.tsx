'use client'

import { useEffect, useState } from 'react'

export default function PushNotificationSetup() {
  const [permission, setPermission] = useState<NotificationPermission>('default')
  const [supported, setSupported] = useState(false)

  useEffect(() => {
    if ('Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window) {
      setSupported(true)
      setPermission(Notification.permission)
    }
  }, [])

  const subscribeToPush = async () => {
    try {
      // Service Workerの登録
      const registration = await navigator.serviceWorker.register('/sw.js')

      // 通知の許可を要求
      const permission = await Notification.requestPermission()
      setPermission(permission)

      if (permission !== 'granted') {
        alert('通知の許可が必要です')
        return
      }

      // VAPID公開鍵を取得
      const response = await fetch('/api/push/vapid-public-key')
      const { publicKey } = await response.json()

      // Push通知のサブスクリプション
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      })

      // サーバーに登録
      await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(subscription.toJSON()),
      })

      alert('プッシュ通知を有効にしました')
    } catch (error) {
      console.error('プッシュ通知の設定に失敗:', error)
      alert('プッシュ通知の設定に失敗しました')
    }
  }

  function urlBase64ToUint8Array(base64String: string) {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')

    const rawData = window.atob(base64)
    const outputArray = new Uint8Array(rawData.length)

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i)
    }
    return outputArray
  }

  if (!supported) {
    return null
  }

  if (permission === 'granted') {
    return (
      <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
        プッシュ通知が有効です
      </div>
    )
  }

  return (
    <div className="bg-blue-50 border border-blue-200 px-4 py-3 rounded">
      <p className="text-sm text-blue-700 mb-2">
        新しいお知らせの通知を受け取るには、プッシュ通知を有効にしてください。
      </p>
      <button
        onClick={subscribeToPush}
        className="text-sm px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        プッシュ通知を有効にする
      </button>
    </div>
  )
}
