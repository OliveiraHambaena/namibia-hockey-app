export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          full_name: string | null
          username: string | null
          avatar_url: string | null
          role: 'admin' | 'manager' | 'player' | 'guest'
          phone: string | null
          bio: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          username?: string | null
          avatar_url?: string | null
          role?: 'admin' | 'manager' | 'player' | 'guest'
          phone?: string | null
          bio?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          username?: string | null
          avatar_url?: string | null
          role?: 'admin' | 'manager' | 'player' | 'guest'
          phone?: string | null
          bio?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      teams: {
        Row: {
          id: string
          name: string
          logo_url: string | null
          city: string | null
          division: string | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          logo_url?: string | null
          city?: string | null
          division?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          logo_url?: string | null
          city?: string | null
          division?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      team_members: {
        Row: {
          id: string
          team_id: string
          user_id: string
          position: string | null
          jersey_number: string | null
          joined_at: string
        }
        Insert: {
          id?: string
          team_id: string
          user_id: string
          position?: string | null
          jersey_number?: string | null
          joined_at?: string
        }
        Update: {
          id?: string
          team_id?: string
          user_id?: string
          position?: string | null
          jersey_number?: string | null
          joined_at?: string
        }
      }
      tournaments: {
        Row: {
          id: string
          title: string
          description: string | null
          location: string | null
          start_date: string
          end_date: string
          registration_deadline: string | null
          status: 'draft' | 'registration_open' | 'registration_closed' | 'in_progress' | 'completed'
          max_teams: number | null
          entry_fee: number | null
          prize_pool: string | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          location?: string | null
          start_date: string
          end_date: string
          registration_deadline?: string | null
          status?: 'draft' | 'registration_open' | 'registration_closed' | 'in_progress' | 'completed'
          max_teams?: number | null
          entry_fee?: number | null
          prize_pool?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          location?: string | null
          start_date?: string
          end_date?: string
          registration_deadline?: string | null
          status?: 'draft' | 'registration_open' | 'registration_closed' | 'in_progress' | 'completed'
          max_teams?: number | null
          entry_fee?: number | null
          prize_pool?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      tournament_teams: {
        Row: {
          id: string
          tournament_id: string
          team_id: string
          registered_at: string
          status: string
        }
        Insert: {
          id?: string
          tournament_id: string
          team_id: string
          registered_at?: string
          status?: string
        }
        Update: {
          id?: string
          tournament_id?: string
          team_id?: string
          registered_at?: string
          status?: string
        }
      }
      news: {
        Row: {
          id: string
          title: string
          content: string
          image_url: string | null
          category: string | null
          author_id: string | null
          published_at: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          content: string
          image_url?: string | null
          category?: string | null
          author_id?: string | null
          published_at?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          content?: string
          image_url?: string | null
          category?: string | null
          author_id?: string | null
          published_at?: string
          created_at?: string
          updated_at?: string
        }
      }
      activities: {
        Row: {
          id: string
          title: string
          description: string | null
          activity_type: 'practice' | 'game' | 'tournament' | 'event'
          team_id: string
          start_time: string
          end_time: string | null
          location: string | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          activity_type: 'practice' | 'game' | 'tournament' | 'event'
          team_id: string
          start_time: string
          end_time?: string | null
          location?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          activity_type?: 'practice' | 'game' | 'tournament' | 'event'
          team_id?: string
          start_time?: string
          end_time?: string | null
          location?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}