'use client'

import { useState } from 'react'
import { useMallStore } from '@/lib/store'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Shop } from '@/lib/types'
import { Send, Loader2 } from 'lucide-react'

interface InquiryDialogProps {
  shop: Shop
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function InquiryDialog({ shop, open, onOpenChange }: InquiryDialogProps) {
  const { language } = useMallStore()
  const isAr = language === 'ar'
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const shopName = isAr && shop.nameAr ? shop.nameAr : shop.name

  const handleSubmit = async () => {
    if (!subject.trim() || !message.trim()) return

    setIsSubmitting(true)
    try {
      // Use the default customer user from seed
      const res = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shopId: shop.id,
          customerId: 'customer',
          subject: subject.trim(),
          message: message.trim(),
        }),
      })

      if (res.ok) {
        setIsSuccess(true)
        setTimeout(() => {
          setSubject('')
          setMessage('')
          setIsSuccess(false)
          onOpenChange(false)
        }, 1500)
      }
    } catch {
      // Silently handle error
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isAr ? `استفسار عن ${shopName}` : `Inquiry about ${shopName}`}
          </DialogTitle>
          <DialogDescription>
            {isAr
              ? 'أرسل استفسارك وسنتواصل معك في أقرب وقت'
              : 'Send your inquiry and we will get back to you soon'}
          </DialogDescription>
        </DialogHeader>

        {isSuccess ? (
          <div className="flex flex-col items-center gap-2 py-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
              <Send className="h-6 w-6 text-green-600" />
            </div>
            <p className="text-sm font-medium text-green-600">
              {isAr ? 'تم إرسال استفسارك بنجاح!' : 'Your inquiry has been sent successfully!'}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="inquiry-subject">
                {isAr ? 'الموضوع' : 'Subject'}
              </Label>
              <Input
                id="inquiry-subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder={isAr ? 'موضوع الاستفسار' : 'Inquiry subject'}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="inquiry-message">
                {isAr ? 'الرسالة' : 'Message'}
              </Label>
              <Textarea
                id="inquiry-message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={
                  isAr
                    ? 'اكتب استفسارك هنا...'
                    : 'Write your inquiry here...'
                }
                rows={4}
              />
            </div>
          </div>
        )}

        {!isSuccess && (
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              {isAr ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={
                !subject.trim() || !message.trim() || isSubmitting
              }
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              {isAr ? 'إرسال' : 'Send'}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  )
}
