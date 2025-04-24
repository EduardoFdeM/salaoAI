{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "definitions": {
    "User": {
      "type": "object",
      "properties": {
        "id":             { "type": "string", "format": "uuid" },
        "name":           { "type": "string" },
        "email":          { "type": "string", "format": "email" },
        "phone":          { "type": "string" },
        "password_hash":  { "type": "string" },
        "isSystemAdmin":  { "type": "boolean", "default": false },
        "active":         { "type": "boolean" },
        "created_at":     { "type": "string", "format": "date-time" },
        "updated_at":     { "type": "string", "format": "date-time" }
      },
      "required": ["id","name","email","phone","password_hash","active","created_at","updated_at"]
    },
    "Salon": {
      "type": "object",
      "properties": {
        "id":                   { "type": "string", "format": "uuid" },
        "name":                 { "type": "string" },
        "address":              { "type": "string" },
        "phone":                { "type": "string" },
        "email":                { "type": "string", "format": "email" },
        "logo_url":             { "type": ["string","null"], "format": "uri" },
        "business_hours":       { "type": "object" },
        "notification_settings":{ "type": "object" },
        "version":              { "type": "integer", "default": 1 },
        "active":               { "type": "boolean" },
        "created_at":           { "type": "string", "format": "date-time" },
        "updated_at":           { "type": "string", "format": "date-time" }
      },
      "required": ["id","name","address","phone","email","business_hours","notification_settings","version","active","created_at","updated_at"]
    },
    "SalonUser": {
      "type": "object",
      "properties": {
        "id": { "type": "string", "format": "uuid" },
        "user_id": { "type": "string", "format": "uuid" },
        "salon_id": { "type": "string", "format": "uuid" },
        "role": { "type": "string", "enum": ["owner","professional","receptionist"] },
        "working_hours": { "type": "object" },
        "active": { "type": "boolean" },
        "created_at": { "type": "string", "format": "date-time" },
        "updated_at": { "type": "string", "format": "date-time" }
      },
      "required": ["id","user_id","salon_id","role","active","created_at","updated_at"]
    },
    "Service": {
      "type": "object",
      "properties": {
        "id":           { "type": "string", "format": "uuid" },
        "salon_id":     { "type": "string", "format": "uuid" },
        "name":         { "type": "string" },
        "description":  { "type": ["string","null"] },
        "price":        { "type": "number" },
        "duration":     { "type": "integer" },
        "version":      { "type": "integer", "default": 1 },
        "active":       { "type": "boolean" },
        "created_at":   { "type": "string", "format": "date-time" },
        "updated_at":   { "type": "string", "format": "date-time" }
      },
      "required": ["id","salon_id","name","price","duration","version","active","created_at","updated_at"]
    },
    "ProfessionalService": {
      "type": "object",
      "properties": {
        "id":              { "type": "string", "format": "uuid" },
        "professional_id": { "type": "string", "format": "uuid" },
        "service_id":      { "type": "string", "format": "uuid" },
        "price":           { "type": "number" },
        "duration_minutes":{ "type": "integer" },
        "version":         { "type": "integer", "default": 1 },
        "active":          { "type": "boolean" },
        "created_at":      { "type": "string", "format": "date-time" },
        "updated_at":      { "type": "string", "format": "date-time" }
      },
      "required": ["id","professional_id","service_id","price","duration_minutes","version","active","created_at","updated_at"]
    },
    "Client": {
      "type": "object",
      "properties": {
        "id":         { "type": "string", "format": "uuid" },
        "salon_id":   { "type": "string", "format": "uuid" },
        "name":       { "type": "string" },
        "phone":      { "type": "string" },
        "email":      { "type": ["string","null"], "format": "email" },
        "notes":      { "type": ["string","null"] },
        "version":    { "type": "integer", "default": 1 },
        "created_at": { "type": "string", "format": "date-time" },
        "updated_at": { "type": "string", "format": "date-time" }
      },
      "required": ["id","salon_id","name","phone","version","created_at","updated_at"]
    },
    "Appointment": {
      "type": "object",
      "properties": {
        "id":             { "type": "string", "format": "uuid" },
        "salon_id":       { "type": "string", "format": "uuid" },
        "client_id":      { "type": "string", "format": "uuid" },
        "professional_id":{ "type": "string", "format": "uuid" },
        "service_id":     { "type": "string", "format": "uuid" },
        "start_time":     { "type": "string", "format": "date-time" },
        "end_time":       { "type": "string", "format": "date-time" },
        "status":         { "type": "string", "enum": ["PENDING","CONFIRMED","COMPLETED","CANCELLED"] },
        "price":          { "type": "number" },
        "notes":          { "type": ["string","null"] },
        "version":        { "type": "integer", "default": 1 },
        "created_at":     { "type": "string", "format": "date-time" },
        "updated_at":     { "type": "string", "format": "date-time" }
      },
      "required": ["id","salon_id","client_id","professional_id","service_id","start_time","end_time","status","price","version","created_at","updated_at"]
      },
    "AppointmentHistory": {
      "type": "object",
      "properties": {
        "id": { "type": "string", "format": "uuid" },
        "appointment_id": { "type": "string", "format": "uuid" },
        "status": { "type": "string" },
        "notes": { "type": "string" },
        "changed_by_user_id": { "type": "string", "format": "uuid" },
        "created_at": { "type": "string", "format": "date-time" }
      },
      "required": ["id","appointment_id","status","changed_by_user_id","created_at"]
    },
    "ChatbotConversation": {
      "type": "object",
      "properties": {
        "id": { "type": "string", "format": "uuid" },
        "client_id": { "type": "string", "format": "uuid" },
        "salon_id": { "type": "string", "format": "uuid" },
        "start_time": { "type": "string", "format": "date-time" },
        "end_time": { "type": "string", "format": "date-time" },
        "status": { "type": "string", "enum": ["active","completed","failed"] },
        "source": { "type": "string", "enum": ["whatsapp","website","app"] },
        "created_at": { "type": "string", "format": "date-time" },
        "updated_at": { "type": "string", "format": "date-time" }
      },
      "required": ["id","client_id","salon_id","start_time","status","created_at","updated_at"]
    },
    "Webhook": {
      "type": "object",
      "properties": {
        "id": { "type": "string", "format": "uuid" },
        "salon_id": { "type": "string", "format": "uuid" },
        "name": { "type": "string" },
        "event_type": { "type": "string" },
        "target_url": { "type": "string", "format": "uri" },
        "headers": { "type": "object" },
        "active": { "type": "boolean" },
        "secret_key": { "type": "string" },
        "created_at": { "type": "string", "format": "date-time" },
        "updated_at": { "type": "string", "format": "date-time" }
      },
      "required": ["id","salon_id","name","event_type","target_url","headers","active","secret_key","created_at","updated_at"]
    },
    "SubscriptionPlan": {
      "type": "object",
      "properties": {
        "id": { "type": "string", "format": "uuid" },
        "name": { "type": "string" },
        "description": { "type": "string" },
        "features": { "type": "object" },
        "price": { "type": "number" },
        "billing_cycle": { "type": "string", "enum": ["monthly","quarterly","yearly"] },
        "active": { "type": "boolean" },
        "created_at": { "type": "string", "format": "date-time" },
        "updated_at": { "type": "string", "format": "date-time" }
      },
      "required": ["id","name","features","price","billing_cycle","active","created_at","updated_at"]
    },
    "SalonSubscription": {
      "type": "object",
      "properties": {
        "id": { "type": "string", "format": "uuid" },
        "salon_id": { "type": "string", "format": "uuid" },
        "plan_id": { "type": "string", "format": "uuid" },
        "status": { "type": "string", "enum": ["active","cancelled","past_due","trialing"] },
        "start_date": { "type": "string", "format": "date" },
        "end_date": { "type": "string", "format": "date" },
        "trial_end_date": { "type": "string", "format": "date" },
        "created_at": { "type": "string", "format": "date-time" },
        "updated_at": { "type": "string", "format": "date-time" }
      },
      "required": ["id","salon_id","plan_id","status","start_date","created_at","updated_at"]
    },
    "Payment": {
      "type": "object",
      "properties": {
        "id": { "type": "string", "format": "uuid" },
        "salon_id": { "type": "string", "format": "uuid" },
        "subscription_id": { "type": "string", "format": "uuid" },
        "amount": { "type": "number" },
        "status": { "type": "string" },
        "payment_method": { "type": "string" },
        "transaction_id": { "type": "string" },
        "notes": { "type": "string" },
        "created_at": { "type": "string", "format": "date-time" },
        "updated_at": { "type": "string", "format": "date-time" }
      },
      "required": ["id","salon_id","subscription_id","amount","status","created_at","updated_at"]
    },
    "SalonSetting": {
      "type": "object",
      "properties": {
        "id": { "type": "string", "format": "uuid" },
        "salon_id": { "type": "string", "format": "uuid" },
        "key": { "type": "string" },
        "value": { "type": ["string","object"] },
        "created_at": { "type": "string", "format": "date-time" },
        "updated_at": { "type": "string", "format": "date-time" }
      },
      "required": ["id","salon_id","key","value","created_at","updated_at"]
    },
    "Report": {
      "type": "object",
      "properties": {
        "id": { "type": "string", "format": "uuid" },
        "salon_id": { "type": "string", "format": "uuid" },
        "title": { "type": "string" },
        "type": { "type": "string" },
        "parameters": { "type": "object" },
        "result_url": { "type": "string", "format": "uri" },
        "status": { "type": "string" },
        "created_by_user_id": { "type": "string", "format": "uuid" },
        "created_at": { "type": "string", "format": "date-time" },
        "updated_at": { "type": "string", "format": "date-time" }
      },
      "required": ["id","salon_id","title","type","parameters","status","created_by_user_id","created_at","updated_at"]
    },
    "Notification": {
      "type": "object",
      "properties": {
        "id":                { "type": "string", "format": "uuid" },
        "salon_id":          { "type": "string", "format": "uuid" },
        "appointment_id":    { "type": ["string","null"], "format": "uuid" },
        "client_id":         { "type": ["string","null"], "format": "uuid" },
        "professional_id":   { "type": ["string","null"], "format": "uuid" },
        "type": {
          "type": "string",
          "enum": ["REMINDER","CONFIRMATION","CANCELLATION","CUSTOM"]
        },
        "payload":           { "type": "object" },
        "status": {
          "type": "string",
          "enum": ["PENDING","SENT","FAILED"]
        },
        "sent_at":           { "type": ["string","null"], "format": "date-time" },
        "created_at":        { "type": "string", "format": "date-time" },
        "updated_at":        { "type": "string", "format": "date-time" }
      },
      "required": ["id","salon_id","type","payload","status","created_at","updated_at"]
    }
  }
}