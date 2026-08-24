export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      admin_audit_log: {
        Row: {
          action: string
          actor_id: string | null
          actor_name: string
          created_at: string
          id: string
          meta: Json
          target: string | null
        }
        Insert: {
          action: string
          actor_id?: string | null
          actor_name?: string
          created_at?: string
          id?: string
          meta?: Json
          target?: string | null
        }
        Update: {
          action?: string
          actor_id?: string | null
          actor_name?: string
          created_at?: string
          id?: string
          meta?: Json
          target?: string | null
        }
        Relationships: []
      }
      audit_events: {
        Row: {
          action: string
          actor_name: string
          actor_user_id: string | null
          created_at: string
          detail: Json
          id: string
          ip: string | null
          kind: string
          profile_id: string | null
          source: string
          target_id: string | null
          user_agent: string | null
        }
        Insert: {
          action: string
          actor_name?: string
          actor_user_id?: string | null
          created_at?: string
          detail?: Json
          id?: string
          ip?: string | null
          kind: string
          profile_id?: string | null
          source?: string
          target_id?: string | null
          user_agent?: string | null
        }
        Update: {
          action?: string
          actor_name?: string
          actor_user_id?: string | null
          created_at?: string
          detail?: Json
          id?: string
          ip?: string | null
          kind?: string
          profile_id?: string | null
          source?: string
          target_id?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      banned_usernames: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          name: string
          reason: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          name: string
          reason?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          name?: string
          reason?: string
        }
        Relationships: []
      }
      boosts: {
        Row: {
          amount: number
          created_at: string
          created_by: string | null
          id: string
          kind: string
          profile_id: string
        }
        Insert: {
          amount?: number
          created_at?: string
          created_by?: string | null
          id?: string
          kind?: string
          profile_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          created_by?: string | null
          id?: string
          kind?: string
          profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "boosts_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_reports: {
        Row: {
          created_at: string
          id: string
          message_author_id: string | null
          message_author_name: string
          message_id: string | null
          message_text: string
          note: string
          reason: string
          reporter_id: string
          reporter_name: string
          resolved_at: string | null
          resolved_by: string | null
          status: string
        }
        Insert: {
          created_at?: string
          id?: string
          message_author_id?: string | null
          message_author_name?: string
          message_id?: string | null
          message_text?: string
          note?: string
          reason?: string
          reporter_id: string
          reporter_name?: string
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string
        }
        Update: {
          created_at?: string
          id?: string
          message_author_id?: string | null
          message_author_name?: string
          message_id?: string | null
          message_text?: string
          note?: string
          reason?: string
          reporter_id?: string
          reporter_name?: string
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string
        }
        Relationships: []
      }
      community_templates: {
        Row: {
          author_name: string
          created_at: string
          description: string
          id: string
          name: string
          preview_username: string
          review_note: string
          reviewed_at: string | null
          reviewed_by: string | null
          source_profile_id: string | null
          status: string
          theme: Json
          updated_at: string
          user_id: string
          uses: number
        }
        Insert: {
          author_name?: string
          created_at?: string
          description?: string
          id?: string
          name: string
          preview_username?: string
          review_note?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          source_profile_id?: string | null
          status?: string
          theme?: Json
          updated_at?: string
          user_id: string
          uses?: number
        }
        Update: {
          author_name?: string
          created_at?: string
          description?: string
          id?: string
          name?: string
          preview_username?: string
          review_note?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          source_profile_id?: string | null
          status?: string
          theme?: Json
          updated_at?: string
          user_id?: string
          uses?: number
        }
        Relationships: [
          {
            foreignKeyName: "community_templates_source_profile_id_fkey"
            columns: ["source_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      devblog_posts: {
        Row: {
          author_id: string | null
          body: string
          cover_url: string | null
          created_at: string
          excerpt: string
          id: string
          published: boolean
          slug: string
          tag: string
          title: string
          updated_at: string
        }
        Insert: {
          author_id?: string | null
          body?: string
          cover_url?: string | null
          created_at?: string
          excerpt?: string
          id?: string
          published?: boolean
          slug: string
          tag?: string
          title: string
          updated_at?: string
        }
        Update: {
          author_id?: string | null
          body?: string
          cover_url?: string | null
          created_at?: string
          excerpt?: string
          id?: string
          published?: boolean
          slug?: string
          tag?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      gallery_images: {
        Row: {
          album: string
          content_type: string
          created_at: string
          id: string
          path: string
          size_bytes: number
          tags: string[]
          title: string
          url: string
          user_id: string
        }
        Insert: {
          album?: string
          content_type?: string
          created_at?: string
          id?: string
          path: string
          size_bytes?: number
          tags?: string[]
          title?: string
          url: string
          user_id: string
        }
        Update: {
          album?: string
          content_type?: string
          created_at?: string
          id?: string
          path?: string
          size_bytes?: number
          tags?: string[]
          title?: string
          url?: string
          user_id?: string
        }
        Relationships: []
      }
      global_chat_message_meta: {
        Row: {
          created_at: string
          fingerprint: string | null
          ip: string | null
          message_id: string
        }
        Insert: {
          created_at?: string
          fingerprint?: string | null
          ip?: string | null
          message_id: string
        }
        Update: {
          created_at?: string
          fingerprint?: string | null
          ip?: string | null
          message_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "global_chat_message_meta_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: true
            referencedRelation: "global_chat_messages"
            referencedColumns: ["id"]
          },
        ]
      }
      global_chat_messages: {
        Row: {
          author_avatar: string | null
          author_name: string
          created_at: string
          id: string
          message: string
          profile_id: string | null
          user_id: string
        }
        Insert: {
          author_avatar?: string | null
          author_name?: string
          created_at?: string
          id?: string
          message: string
          profile_id?: string | null
          user_id: string
        }
        Update: {
          author_avatar?: string | null
          author_name?: string
          created_at?: string
          id?: string
          message?: string
          profile_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "global_chat_messages_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      integration_settings: {
        Row: {
          category: string
          created_at: string
          id: string
          key: string
          label: string
          updated_at: string
          updated_by: string | null
          value: string | null
          value_hint: string | null
        }
        Insert: {
          category?: string
          created_at?: string
          id?: string
          key: string
          label: string
          updated_at?: string
          updated_by?: string | null
          value?: string | null
          value_hint?: string | null
        }
        Update: {
          category?: string
          created_at?: string
          id?: string
          key?: string
          label?: string
          updated_at?: string
          updated_by?: string | null
          value?: string | null
          value_hint?: string | null
        }
        Relationships: []
      }
      ip_logs: {
        Row: {
          city: string | null
          country: string | null
          created_at: string
          event: string
          id: string
          ip: string
          isp: string | null
          lat: number | null
          lon: number | null
          path: string | null
          profile_id: string | null
          proxy: boolean
          region: string | null
          timezone: string | null
          user_agent: string | null
          user_id: string | null
          username: string | null
        }
        Insert: {
          city?: string | null
          country?: string | null
          created_at?: string
          event?: string
          id?: string
          ip: string
          isp?: string | null
          lat?: number | null
          lon?: number | null
          path?: string | null
          profile_id?: string | null
          proxy?: boolean
          region?: string | null
          timezone?: string | null
          user_agent?: string | null
          user_id?: string | null
          username?: string | null
        }
        Update: {
          city?: string | null
          country?: string | null
          created_at?: string
          event?: string
          id?: string
          ip?: string
          isp?: string | null
          lat?: number | null
          lon?: number | null
          path?: string | null
          profile_id?: string | null
          proxy?: boolean
          region?: string | null
          timezone?: string | null
          user_agent?: string | null
          user_id?: string | null
          username?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ip_logs_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      link_clicks: {
        Row: {
          browser: string | null
          country: string | null
          created_at: string
          device: string | null
          id: string
          label: string | null
          link_id: string | null
          profile_id: string
          referrer: string | null
        }
        Insert: {
          browser?: string | null
          country?: string | null
          created_at?: string
          device?: string | null
          id?: string
          label?: string | null
          link_id?: string | null
          profile_id: string
          referrer?: string | null
        }
        Update: {
          browser?: string | null
          country?: string | null
          created_at?: string
          device?: string | null
          id?: string
          label?: string | null
          link_id?: string | null
          profile_id?: string
          referrer?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "link_clicks_link_id_fkey"
            columns: ["link_id"]
            isOneToOne: false
            referencedRelation: "links"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "link_clicks_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      links: {
        Row: {
          active: boolean
          created_at: string
          icon: string
          id: string
          position: number
          profile_id: string
          title: string
          url: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          icon?: string
          id?: string
          position?: number
          profile_id: string
          title: string
          url: string
        }
        Update: {
          active?: boolean
          created_at?: string
          icon?: string
          id?: string
          position?: number
          profile_id?: string
          title?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "links_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      login_codes: {
        Row: {
          code: string
          created_at: string
          updated_at: string
          user_id: string
        }
        Insert: {
          code: string
          created_at?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          code?: string
          created_at?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      mission_claims: {
        Row: {
          created_at: string
          id: string
          mission_key: string
          reward: number
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          mission_key: string
          reward?: number
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          mission_key?: string
          reward?: number
          user_id?: string
        }
        Relationships: []
      }
      og_listings: {
        Row: {
          contact: string | null
          created_at: string
          currency: string
          id: string
          note: string | null
          price: number
          profile_id: string
          status: string
          updated_at: string
          user_id: string
          username: string
        }
        Insert: {
          contact?: string | null
          created_at?: string
          currency?: string
          id?: string
          note?: string | null
          price?: number
          profile_id: string
          status?: string
          updated_at?: string
          user_id: string
          username: string
        }
        Update: {
          contact?: string | null
          created_at?: string
          currency?: string
          id?: string
          note?: string | null
          price?: number
          profile_id?: string
          status?: string
          updated_at?: string
          user_id?: string
          username?: string
        }
        Relationships: [
          {
            foreignKeyName: "og_listings_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_orders: {
        Row: {
          amount_cents: number
          buyer_id: string
          checkout_url: string | null
          created_at: string
          currency: string
          id: string
          kind: string
          message: string
          provider: string
          provider_payment_id: string | null
          rank: string
          recipient_user_id: string | null
          recipient_username: string
          status: string
          updated_at: string
        }
        Insert: {
          amount_cents: number
          buyer_id: string
          checkout_url?: string | null
          created_at?: string
          currency?: string
          id?: string
          kind?: string
          message?: string
          provider?: string
          provider_payment_id?: string | null
          rank: string
          recipient_user_id?: string | null
          recipient_username: string
          status?: string
          updated_at?: string
        }
        Update: {
          amount_cents?: number
          buyer_id?: string
          checkout_url?: string | null
          created_at?: string
          currency?: string
          id?: string
          kind?: string
          message?: string
          provider?: string
          provider_payment_id?: string | null
          rank?: string
          recipient_user_id?: string | null
          recipient_username?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      profile_badges: {
        Row: {
          badge_key: string
          created_at: string
          id: string
          position: number
          profile_id: string
        }
        Insert: {
          badge_key: string
          created_at?: string
          id?: string
          position?: number
          profile_id: string
        }
        Update: {
          badge_key?: string
          created_at?: string
          id?: string
          position?: number
          profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profile_badges_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_likes: {
        Row: {
          created_at: string
          id: string
          profile_id: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          profile_id: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          profile_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profile_likes_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_presets: {
        Row: {
          avatar_url: string | null
          banner_url: string | null
          bio: string
          created_at: string
          display_name: string
          id: string
          location: string
          name: string
          theme: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          banner_url?: string | null
          bio?: string
          created_at?: string
          display_name?: string
          id?: string
          location?: string
          name?: string
          theme?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          banner_url?: string | null
          bio?: string
          created_at?: string
          display_name?: string
          id?: string
          location?: string
          name?: string
          theme?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profile_views: {
        Row: {
          browser: string | null
          country: string | null
          created_at: string
          device: string | null
          fingerprint: string | null
          id: string
          ip: string | null
          profile_id: string
          referrer: string | null
        }
        Insert: {
          browser?: string | null
          country?: string | null
          created_at?: string
          device?: string | null
          fingerprint?: string | null
          id?: string
          ip?: string | null
          profile_id: string
          referrer?: string | null
        }
        Update: {
          browser?: string | null
          country?: string | null
          created_at?: string
          device?: string | null
          fingerprint?: string | null
          id?: string
          ip?: string | null
          profile_id?: string
          referrer?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profile_views_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          banner_url: string | null
          bio: string
          created_at: string
          display_name: string
          domain: string
          featured: boolean
          featured_until: string | null
          id: string
          like_count: number
          location: string
          music: Json
          rank: string
          theme: Json
          uid: number
          updated_at: string
          user_id: string | null
          username: string
          username_changed_at: string | null
          username_set: boolean
          verified: boolean
          view_count: number
        }
        Insert: {
          avatar_url?: string | null
          banner_url?: string | null
          bio?: string
          created_at?: string
          display_name?: string
          domain?: string
          featured?: boolean
          featured_until?: string | null
          id?: string
          like_count?: number
          location?: string
          music?: Json
          rank?: string
          theme?: Json
          uid?: number
          updated_at?: string
          user_id?: string | null
          username: string
          username_changed_at?: string | null
          username_set?: boolean
          verified?: boolean
          view_count?: number
        }
        Update: {
          avatar_url?: string | null
          banner_url?: string | null
          bio?: string
          created_at?: string
          display_name?: string
          domain?: string
          featured?: boolean
          featured_until?: string | null
          id?: string
          like_count?: number
          location?: string
          music?: Json
          rank?: string
          theme?: Json
          uid?: number
          updated_at?: string
          user_id?: string | null
          username?: string
          username_changed_at?: string | null
          username_set?: boolean
          verified?: boolean
          view_count?: number
        }
        Relationships: []
      }
      rank_gifts: {
        Row: {
          created_at: string
          id: string
          message: string
          price: number
          rank: string
          recipient_user_id: string
          recipient_username: string
          sender_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message?: string
          price: number
          rank: string
          recipient_user_id: string
          recipient_username: string
          sender_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          price?: number
          rank?: string
          recipient_user_id?: string
          recipient_username?: string
          sender_id?: string
        }
        Relationships: []
      }
      rank_reviews: {
        Row: {
          created_at: string
          id: string
          note: string
          profile_id: string
          rank: string
          reason: string
          resolved_at: string | null
          resolved_by: string | null
          status: string
          username: string
        }
        Insert: {
          created_at?: string
          id?: string
          note?: string
          profile_id: string
          rank: string
          reason?: string
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string
          username: string
        }
        Update: {
          created_at?: string
          id?: string
          note?: string
          profile_id?: string
          rank?: string
          reason?: string
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string
          username?: string
        }
        Relationships: [
          {
            foreignKeyName: "rank_reviews_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      reports: {
        Row: {
          category: string
          created_at: string
          id: string
          message: string
          reporter_id: string | null
          status: string
          target_profile_id: string | null
        }
        Insert: {
          category?: string
          created_at?: string
          id?: string
          message?: string
          reporter_id?: string | null
          status?: string
          target_profile_id?: string | null
        }
        Update: {
          category?: string
          created_at?: string
          id?: string
          message?: string
          reporter_id?: string | null
          status?: string
          target_profile_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reports_target_profile_id_fkey"
            columns: ["target_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      sanctions: {
        Row: {
          active: boolean
          created_at: string
          created_by: string | null
          expires_at: string | null
          id: string
          kind: string
          profile_id: string | null
          reason: string
          user_id: string | null
        }
        Insert: {
          active?: boolean
          created_at?: string
          created_by?: string | null
          expires_at?: string | null
          id?: string
          kind?: string
          profile_id?: string | null
          reason?: string
          user_id?: string | null
        }
        Update: {
          active?: boolean
          created_at?: string
          created_by?: string | null
          expires_at?: string | null
          id?: string
          kind?: string
          profile_id?: string | null
          reason?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sanctions_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      security_alert_deliveries: {
        Row: {
          delivered_at: string
          error: string | null
          event_id: string
          ok: boolean
          target: string
        }
        Insert: {
          delivered_at?: string
          error?: string | null
          event_id: string
          ok?: boolean
          target: string
        }
        Update: {
          delivered_at?: string
          error?: string | null
          event_id?: string
          ok?: boolean
          target?: string
        }
        Relationships: []
      }
      service_status: {
        Row: {
          id: string
          latency_ms: number
          name: string
          note: string
          status: string
          updated_at: string
        }
        Insert: {
          id?: string
          latency_ms?: number
          name: string
          note?: string
          status?: string
          updated_at?: string
        }
        Update: {
          id?: string
          latency_ms?: number
          name?: string
          note?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      shop_items: {
        Row: {
          created_at: string
          key: string
          kind: string
          price: number
        }
        Insert: {
          created_at?: string
          key: string
          kind?: string
          price?: number
        }
        Update: {
          created_at?: string
          key?: string
          kind?: string
          price?: number
        }
        Relationships: []
      }
      shop_price_reference: {
        Row: {
          key: string
          price: number
          updated_at: string
        }
        Insert: {
          key: string
          price: number
          updated_at?: string
        }
        Update: {
          key?: string
          price?: number
          updated_at?: string
        }
        Relationships: []
      }
      signup_attempts: {
        Row: {
          created_at: string
          id: string
          ip: string | null
          kind: string
          ok: boolean
          reason: string
          user_agent: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          ip?: string | null
          kind?: string
          ok?: boolean
          reason?: string
          user_agent?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          ip?: string | null
          kind?: string
          ok?: boolean
          reason?: string
          user_agent?: string | null
        }
        Relationships: []
      }
      site_bans: {
        Row: {
          active: boolean
          created_at: string
          evidence: Json
          fingerprint: string | null
          id: string
          ip: string | null
          lifted_at: string | null
          lifted_by: string | null
          profile_id: string | null
          reason: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          active?: boolean
          created_at?: string
          evidence?: Json
          fingerprint?: string | null
          id?: string
          ip?: string | null
          lifted_at?: string | null
          lifted_by?: string | null
          profile_id?: string | null
          reason?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          active?: boolean
          created_at?: string
          evidence?: Json
          fingerprint?: string | null
          id?: string
          ip?: string | null
          lifted_at?: string | null
          lifted_by?: string | null
          profile_id?: string | null
          reason?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      socials: {
        Row: {
          created_at: string
          id: string
          platform: string
          position: number
          profile_id: string
          url: string
        }
        Insert: {
          created_at?: string
          id?: string
          platform: string
          position?: number
          profile_id: string
          url: string
        }
        Update: {
          created_at?: string
          id?: string
          platform?: string
          position?: number
          profile_id?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "socials_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      streak_claims: {
        Row: {
          balance_after: number
          bonus: number
          claim_date: string
          created_at: string
          id: string
          milestone_days: number | null
          milestone_item: string | null
          milestone_reward: number
          reward: number
          streak: number
          user_id: string
        }
        Insert: {
          balance_after?: number
          bonus?: number
          claim_date: string
          created_at?: string
          id?: string
          milestone_days?: number | null
          milestone_item?: string | null
          milestone_reward?: number
          reward: number
          streak: number
          user_id: string
        }
        Update: {
          balance_after?: number
          bonus?: number
          claim_date?: string
          created_at?: string
          id?: string
          milestone_days?: number | null
          milestone_item?: string | null
          milestone_reward?: number
          reward?: number
          streak?: number
          user_id?: string
        }
        Relationships: []
      }
      streak_milestones: {
        Row: {
          created_at: string
          days: number
          id: string
          item_key: string | null
          reward: number
          user_id: string
        }
        Insert: {
          created_at?: string
          days: number
          id?: string
          item_key?: string | null
          reward?: number
          user_id: string
        }
        Update: {
          created_at?: string
          days?: number
          id?: string
          item_key?: string | null
          reward?: number
          user_id?: string
        }
        Relationships: []
      }
      threats: {
        Row: {
          created_at: string
          detail: string
          id: string
          kind: string
          severity: string
          source_ip: string | null
          status: string
        }
        Insert: {
          created_at?: string
          detail?: string
          id?: string
          kind?: string
          severity?: string
          source_ip?: string | null
          status?: string
        }
        Update: {
          created_at?: string
          detail?: string
          id?: string
          kind?: string
          severity?: string
          source_ip?: string | null
          status?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_streaks: {
        Row: {
          best_days: number
          created_at: string
          current_days: number
          last_claim_date: string | null
          total_claims: number
          updated_at: string
          user_id: string
        }
        Insert: {
          best_days?: number
          created_at?: string
          current_days?: number
          last_claim_date?: string | null
          total_claims?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          best_days?: number
          created_at?: string
          current_days?: number
          last_claim_date?: string | null
          total_claims?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_unlocks: {
        Row: {
          created_at: string
          id: string
          item_key: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          item_key: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          item_key?: string
          user_id?: string
        }
        Relationships: []
      }
      user_wallets: {
        Row: {
          coins: number
          updated_at: string
          user_id: string
        }
        Insert: {
          coins?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          coins?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      wall_posts: {
        Row: {
          author_avatar: string | null
          author_id: string | null
          author_name: string
          author_profile_id: string | null
          created_at: string
          id: string
          message: string
          profile_id: string
        }
        Insert: {
          author_avatar?: string | null
          author_id?: string | null
          author_name?: string
          author_profile_id?: string | null
          created_at?: string
          id?: string
          message: string
          profile_id: string
        }
        Update: {
          author_avatar?: string | null
          author_id?: string | null
          author_name?: string
          author_profile_id?: string | null
          created_at?: string
          id?: string
          message?: string
          profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wall_posts_author_profile_id_fkey"
            columns: ["author_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wall_posts_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_grant_coins: {
        Args: { _amount: number; _user_id: string }
        Returns: number
      }
      claim_daily_reward: { Args: never; Returns: Json }
      claim_mission: { Args: { _key: string }; Returns: number }
      complete_payment_order: {
        Args: { _order_id: string; _payment_id: string }
        Returns: string
      }
      expire_featured: { Args: never; Returns: undefined }
      gallery_is_public_owner: { Args: { _user_id: string }; Returns: boolean }
      gift_rank: {
        Args: { _message?: string; _rank: string; _username: string }
        Returns: number
      }
      grant_imagehost_badge_for_user: {
        Args: { _user_id: string }
        Returns: undefined
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_banned: {
        Args: { _fingerprint: string; _user_id: string }
        Returns: boolean
      }
      is_banned_ctx: {
        Args: { _fingerprint: string; _ip: string; _user_id: string }
        Returns: boolean
      }
      is_site_owner: { Args: { _user_id: string }; Returns: boolean }
      mission_progress: { Args: { _key: string }; Returns: number }
      new_login_code: { Args: never; Returns: string }
      post_chat_message: {
        Args: {
          _author_avatar: string
          _author_name: string
          _fingerprint: string
          _ip: string
          _message: string
          _profile_id: string
          _user_id: string
        }
        Returns: string
      }
      purchase_featured: { Args: { _profile_id: string }; Returns: string }
      purchase_item: { Args: { _key: string }; Returns: number }
      reconcile_shop: { Args: never; Returns: Json }
      resolve_rank_review: {
        Args: { _decision: string; _note?: string; _review_id: string }
        Returns: string
      }
      rotate_login_code: { Args: never; Returns: string }
      use_community_template: { Args: { _id: string }; Returns: number }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
