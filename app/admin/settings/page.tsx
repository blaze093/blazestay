"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import AdminHeader from "@/components/admin/admin-header"
import { useToast } from "@/hooks/use-toast"

export default function SettingsPage() {
  const { toast } = useToast()
  const [saving, setSaving] = useState(false)

  // General settings
  const [generalSettings, setGeneralSettings] = useState({
    siteName: "TazaTokri",
    siteDescription: "Fresh Farm Products Marketplace",
    contactEmail: "support@tazatokri.com",
    contactPhone: "+91 9876543210",
    address: "123 Farm Road, Bangalore, Karnataka, India",
  })

  // Payment settings
  const [paymentSettings, setPaymentSettings] = useState({
    enableCashOnDelivery: true,
    enableOnlinePayment: true,
    enableWalletPayment: false,
    serviceFeePercentage: 5,
    minimumOrderAmount: 100,
  })

  // Notification settings
  const [notificationSettings, setNotificationSettings] = useState({
    enableEmailNotifications: true,
    enablePushNotifications: true,
    enableSmsNotifications: false,
    notifyOnNewOrder: true,
    notifyOnOrderStatusChange: true,
    notifyOnLowStock: true,
    adminEmailForNotifications: "admin@tazatokri.com",
  })

  const handleGeneralSettingsChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setGeneralSettings((prev) => ({ ...prev, [name]: value }))
  }

  const handlePaymentSettingsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target
    setPaymentSettings((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : type === "number" ? Number(value) : value,
    }))
  }

  const handleSwitchChange = (name: string, checked: boolean, settingsType: string) => {
    if (settingsType === "payment") {
      setPaymentSettings((prev) => ({ ...prev, [name]: checked }))
    } else if (settingsType === "notification") {
      setNotificationSettings((prev) => ({ ...prev, [name]: checked }))
    }
  }

  const handleNotificationSettingsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target
    setNotificationSettings((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }))
  }

  const saveSettings = async (type: string) => {
    setSaving(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast({
        title: "Settings saved",
        description: `${type.charAt(0).toUpperCase() + type.slice(1)} settings have been updated successfully.`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <AdminHeader title="Settings" description="Manage your marketplace settings" />

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="payment">Payment</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>Manage your marketplace general information and contact details.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="siteName">Site Name</Label>
                  <Input
                    id="siteName"
                    name="siteName"
                    value={generalSettings.siteName}
                    onChange={handleGeneralSettingsChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactEmail">Contact Email</Label>
                  <Input
                    id="contactEmail"
                    name="contactEmail"
                    type="email"
                    value={generalSettings.contactEmail}
                    onChange={handleGeneralSettingsChange}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="siteDescription">Site Description</Label>
                <Textarea
                  id="siteDescription"
                  name="siteDescription"
                  value={generalSettings.siteDescription}
                  onChange={handleGeneralSettingsChange}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contactPhone">Contact Phone</Label>
                  <Input
                    id="contactPhone"
                    name="contactPhone"
                    value={generalSettings.contactPhone}
                    onChange={handleGeneralSettingsChange}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Business Address</Label>
                <Textarea
                  id="address"
                  name="address"
                  value={generalSettings.address}
                  onChange={handleGeneralSettingsChange}
                  rows={3}
                />
              </div>

              <Button
                onClick={() => saveSettings("general")}
                disabled={saving}
                className="bg-dark-olive hover:bg-earthy-brown"
              >
                {saving ? "Saving..." : "Save Settings"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payment">
          <Card>
            <CardHeader>
              <CardTitle>Payment Settings</CardTitle>
              <CardDescription>Configure payment methods and transaction settings.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Cash on Delivery</h3>
                    <p className="text-sm text-muted-foreground">
                      Allow customers to pay when they receive their order
                    </p>
                  </div>
                  <Switch
                    checked={paymentSettings.enableCashOnDelivery}
                    onCheckedChange={(checked) => handleSwitchChange("enableCashOnDelivery", checked, "payment")}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Online Payment</h3>
                    <p className="text-sm text-muted-foreground">
                      Allow customers to pay online using cards, UPI, etc.
                    </p>
                  </div>
                  <Switch
                    checked={paymentSettings.enableOnlinePayment}
                    onCheckedChange={(checked) => handleSwitchChange("enableOnlinePayment", checked, "payment")}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Wallet Payment</h3>
                    <p className="text-sm text-muted-foreground">Allow customers to pay using their TazaTokri wallet</p>
                  </div>
                  <Switch
                    checked={paymentSettings.enableWalletPayment}
                    onCheckedChange={(checked) => handleSwitchChange("enableWalletPayment", checked, "payment")}
                  />
                </div>
              </div>

              <div className="border-t pt-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="serviceFeePercentage">Service Fee Percentage (%)</Label>
                    <Input
                      id="serviceFeePercentage"
                      name="serviceFeePercentage"
                      type="number"
                      min="0"
                      max="100"
                      value={paymentSettings.serviceFeePercentage}
                      onChange={handlePaymentSettingsChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="minimumOrderAmount">Minimum Order Amount (₹)</Label>
                    <Input
                      id="minimumOrderAmount"
                      name="minimumOrderAmount"
                      type="number"
                      min="0"
                      value={paymentSettings.minimumOrderAmount}
                      onChange={handlePaymentSettingsChange}
                    />
                  </div>
                </div>
              </div>

              <Button
                onClick={() => saveSettings("payment")}
                disabled={saving}
                className="bg-dark-olive hover:bg-earthy-brown"
              >
                {saving ? "Saving..." : "Save Settings"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>Configure how and when notifications are sent.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Email Notifications</h3>
                    <p className="text-sm text-muted-foreground">Send notifications via email</p>
                  </div>
                  <Switch
                    checked={notificationSettings.enableEmailNotifications}
                    onCheckedChange={(checked) =>
                      handleSwitchChange("enableEmailNotifications", checked, "notification")
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Push Notifications</h3>
                    <p className="text-sm text-muted-foreground">Send notifications via browser push notifications</p>
                  </div>
                  <Switch
                    checked={notificationSettings.enablePushNotifications}
                    onCheckedChange={(checked) =>
                      handleSwitchChange("enablePushNotifications", checked, "notification")
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">SMS Notifications</h3>
                    <p className="text-sm text-muted-foreground">
                      Send notifications via SMS (additional charges may apply)
                    </p>
                  </div>
                  <Switch
                    checked={notificationSettings.enableSmsNotifications}
                    onCheckedChange={(checked) => handleSwitchChange("enableSmsNotifications", checked, "notification")}
                  />
                </div>
              </div>

              <div className="border-t pt-4 space-y-4">
                <h3 className="font-medium">Notification Events</h3>

                <div className="flex items-center justify-between">
                  <div>
                    <p>New Order</p>
                    <p className="text-sm text-muted-foreground">Notify when a new order is placed</p>
                  </div>
                  <Switch
                    checked={notificationSettings.notifyOnNewOrder}
                    onCheckedChange={(checked) => handleSwitchChange("notifyOnNewOrder", checked, "notification")}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p>Order Status Change</p>
                    <p className="text-sm text-muted-foreground">Notify when an order status changes</p>
                  </div>
                  <Switch
                    checked={notificationSettings.notifyOnOrderStatusChange}
                    onCheckedChange={(checked) =>
                      handleSwitchChange("notifyOnOrderStatusChange", checked, "notification")
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p>Low Stock</p>
                    <p className="text-sm text-muted-foreground">Notify when product stock is running low</p>
                  </div>
                  <Switch
                    checked={notificationSettings.notifyOnLowStock}
                    onCheckedChange={(checked) => handleSwitchChange("notifyOnLowStock", checked, "notification")}
                  />
                </div>
              </div>

              <div className="border-t pt-4 space-y-2">
                <Label htmlFor="adminEmailForNotifications">Admin Email for Notifications</Label>
                <Input
                  id="adminEmailForNotifications"
                  name="adminEmailForNotifications"
                  type="email"
                  value={notificationSettings.adminEmailForNotifications}
                  onChange={handleNotificationSettingsChange}
                />
              </div>

              <Button
                onClick={() => saveSettings("notification")}
                disabled={saving}
                className="bg-dark-olive hover:bg-earthy-brown"
              >
                {saving ? "Saving..." : "Save Settings"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle>Appearance Settings</CardTitle>
              <CardDescription>Customize the look and feel of your marketplace.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  Appearance settings coming soon. This will allow you to customize colors, logos, and themes.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="advanced">
          <Card>
            <CardHeader>
              <CardTitle>Advanced Settings</CardTitle>
              <CardDescription>Configure advanced settings for your marketplace.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  Advanced settings coming soon. This will include API keys, webhooks, and integration settings.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
