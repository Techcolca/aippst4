import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { useAuth } from "@/context/auth-context";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { apiRequest } from "@/lib/queryClient";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  BarChart,
  Users,
  MessageSquare,
  UserPlus,
  Settings,
  Database,
  AlertTriangle,
  Search,
  Edit,
  User,
  CreditCard
} from "lucide-react";

// Interfaces
interface AdminStats {
  users: {
    total_users: number;
    new_users_last_7_days: number;
  };
  conversations: {
    total_conversations: number;
    new_conversations_last_7_days: number;
    resolved_conversations: number;
    avg_duration: number;
  };
  messages: {
    total_messages: number;
    assistant_messages: number;
    user_messages: number;
    new_messages_last_7_days: number;
  };
  subscriptions: {
    total_subscriptions: number;
    free_subscriptions: number;
    basic_subscriptions: number;
    professional_subscriptions: number;
    enterprise_subscriptions: number;
    active_subscriptions: number;
  };
  tokens: {
    estimated_tokens_used: number;
    estimated_cost_usd: number;
  };
  limits: {
    users_near_limit: number;
    users_over_limit: number;
  };
}

interface UserInfo {
  id: number;
  username: string;
  email: string;
  full_name: string;
  created_at: string;
  api_key: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
}

interface UserDetails {
  user: UserInfo;
  subscriptions: Array<{
    id: number;
    tier: string;
    status: string;
    interactions_limit: number;
    interactions_used: number;
    created_at: string;
    start_date: string;
    end_date: string | null;
  }>;
  integrations: Array<{
    id: number;
    name: string;
    url: string;
    theme_color: string;
    position: string;
    active: boolean;
    api_key: string;
    visitor_count: number;
    created_at: string;
    bot_behavior: string | null;
    widget_type: string | null;
  }>;
  recentConversations: Array<{
    id: number;
    integration_id: number;
    visitor_id: string;
    resolved: boolean;
    duration: number;
    created_at: string;
    updated_at: string;
    integration_name: string;
  }>;
  usage: {
    total_conversations: number;
    total_messages: number;
    resolved_conversations: number;
    assistant_messages: number;
    user_messages: number;
    estimated_tokens: number;
  };
}

interface UserOverLimit {
  id: number;
  username: string;
  email: string;
  full_name: string;
  tier: string;
  interactions_limit: number;
  interactions_used: number;
  end_date: string | null;
  status: string;
  usage_percentage: number;
}

const formatDate = (dateString: string) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('es-ES', {
    year: 'numeric', 
    month: 'short', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export default function AdminPanel() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [location, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [selectedUser, setSelectedUser] = useState<number | null>(null);
  const [userSearch, setUserSearch] = useState("");
  const [usersOverLimit, setUsersOverLimit] = useState<UserOverLimit[]>([]);
  
  // Modals
  const [userDetailsModal, setUserDetailsModal] = useState(false);
  const [createUserModal, setCreateUserModal] = useState(false);
  const [editUserModal, setEditUserModal] = useState(false);
  const [subscriptionModal, setSubscriptionModal] = useState(false);
  
  // Form states
  const [newUser, setNewUser] = useState({
    username: "",
    password: "",
    email: "",
    fullName: "",
    tier: "free"
  });
  
  const [editUserData, setEditUserData] = useState({
    id: 0,
    username: "",
    email: "",
    fullName: "",
    password: ""
  });
  
  const [editSubscriptionData, setEditSubscriptionData] = useState({
    userId: 0,
    tier: "",
    status: "active",
    interactionsLimit: 0,
    endDate: ""
  });
  
  // Verificar si el usuario es administrador
  useEffect(() => {
    console.log("Usuario actual:", user?.username);
    if (!user) {
      // Si no hay usuario, esperar a que se cargue
      return;
    }
    
    if (user.username !== 'admin') {
      console.log("Acceso denegado al panel de administración para:", user.username);
      toast({
        title: "Acceso restringido",
        description: "No tienes permisos para acceder al panel de administración",
        variant: "destructive"
      });
      navigate("/dashboard");
    } else {
      console.log("Acceso autorizado al panel de administración para:", user.username);
    }
  }, [user, navigate, toast]);
  
  // Query para obtener estadísticas de administrador
  const { data: adminStats, isLoading: isLoadingStats, refetch: refetchStats } = useQuery<AdminStats>({
    queryKey: ["/api/admin/stats"],
    enabled: !!user && user.username === 'admin',
    refetchInterval: 30000, // Actualizar cada 30 segundos
  });
  
  // Query para obtener lista de usuarios
  const { data: users, isLoading: isLoadingUsers, refetch: refetchUsers } = useQuery<UserInfo[]>({
    queryKey: ["/api/admin/users"],
    enabled: !!user && user.username === 'admin' && activeTab === "users",
  });
  
  // Query para obtener detalles de un usuario específico
  const { data: userDetails, isLoading: isLoadingUserDetails, refetch: refetchUserDetails } = useQuery<UserDetails>({
    queryKey: ["/api/admin/users", selectedUser],
    enabled: !!selectedUser,
  });
  
  // Query para obtener usuarios cercanos al límite
  const { data: usersNearLimit, isLoading: isLoadingUsersNearLimit } = useQuery<UserOverLimit[]>({
    queryKey: ["/api/admin/users/near-limit"],
    enabled: !!user && user.username === 'admin' && activeTab === "limits",
  });
  
  // Actualizar estado cuando los datos cambien
  useEffect(() => {
    if (usersNearLimit) {
      setUsersOverLimit(usersNearLimit);
    }
  }, [usersNearLimit]);
  
  // Crear un nuevo usuario
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newUser.username || !newUser.password || !newUser.email) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos requeridos",
        variant: "destructive"
      });
      return;
    }
    
    try {
      await apiRequest("POST", "/api/admin/users", newUser);
      
      toast({
        title: "Usuario creado",
        description: "El usuario ha sido creado exitosamente"
      });
      
      // Cerrar modal y refrescar datos
      setCreateUserModal(false);
      setNewUser({
        username: "",
        password: "",
        email: "",
        fullName: "",
        tier: "free"
      });
      
      // Refrescar lista de usuarios sin recargar la página
      refetchUsers();
      refetchStats();
    } catch (error) {
      console.error("Error creating user:", error);
      toast({
        title: "Error",
        description: "No se pudo crear el usuario. Por favor, intenta de nuevo.",
        variant: "destructive"
      });
    }
  };
  
  // Editar un usuario existente
  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Al menos un campo debe estar completado
    if (!editUserData.username && !editUserData.email && !editUserData.fullName && !editUserData.password) {
      toast({
        title: "Error",
        description: "Debes modificar al menos un campo",
        variant: "destructive"
      });
      return;
    }
    
    try {
      // Construir objeto con solo los campos que tienen valor
      const updateData: any = {};
      if (editUserData.username) updateData.username = editUserData.username;
      if (editUserData.email) updateData.email = editUserData.email;
      if (editUserData.fullName) updateData.fullName = editUserData.fullName;
      if (editUserData.password) updateData.password = editUserData.password;
      
      await apiRequest("PATCH", `/api/admin/users/${editUserData.id}`, updateData);
      
      toast({
        title: "Usuario actualizado",
        description: "El usuario ha sido actualizado exitosamente"
      });
      
      // Cerrar modal y refrescar datos
      setEditUserModal(false);
      
      // Refrescar detalles del usuario si está seleccionado
      if (selectedUser === editUserData.id) {
        setUserDetailsModal(true);
      }
      
      // Refrescar lista de usuarios
      refetchUsers();
      refetchStats();
    } catch (error) {
      console.error("Error updating user:", error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el usuario. Por favor, intenta de nuevo.",
        variant: "destructive"
      });
    }
  };
  
  // Editar suscripción de un usuario
  const handleEditSubscription = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const updateData: any = {};
      if (editSubscriptionData.tier) updateData.tier = editSubscriptionData.tier;
      if (editSubscriptionData.status) updateData.status = editSubscriptionData.status;
      if (editSubscriptionData.interactionsLimit) {
        updateData.interactionsLimit = parseInt(editSubscriptionData.interactionsLimit.toString());
      }
      if (editSubscriptionData.endDate) updateData.endDate = editSubscriptionData.endDate;
      
      await apiRequest(
        "PATCH", 
        `/api/admin/users/${editSubscriptionData.userId}/subscription`, 
        updateData
      );
      
      toast({
        title: "Suscripción actualizada",
        description: "La suscripción ha sido actualizada exitosamente"
      });
      
      // Cerrar modal y refrescar datos
      setSubscriptionModal(false);
      
      // Refrescar datos sin recargar la página
      refetchUsers();
      refetchStats();
      
      // Si hay un usuario seleccionado, refrescar sus detalles
      if (selectedUser === editSubscriptionData.userId) {
        refetchUserDetails();
        setUserDetailsModal(true);
      }
    } catch (error) {
      console.error("Error updating subscription:", error);
      toast({
        title: "Error",
        description: "No se pudo actualizar la suscripción. Por favor, intenta de nuevo.",
        variant: "destructive"
      });
    }
  };
  
  // Ver detalles de un usuario
  const handleViewUserDetails = (userId: number) => {
    setSelectedUser(userId);
    setUserDetailsModal(true);
  };
  
  // Preparar la edición de un usuario
  const handlePrepareEditUser = (user: UserInfo) => {
    setEditUserData({
      id: user.id,
      username: "",
      email: "",
      fullName: "",
      password: ""
    });
    setEditUserModal(true);
  };
  
  // Preparar la edición de una suscripción
  const handlePrepareEditSubscription = (userId: number, subscription?: UserDetails['subscriptions'][0]) => {
    setEditSubscriptionData({
      userId,
      tier: subscription?.tier || "free",
      status: subscription?.status || "active",
      interactionsLimit: subscription?.interactions_limit || 0,
      endDate: subscription?.end_date ? new Date(subscription.end_date).toISOString().split('T')[0] : ""
    });
    setSubscriptionModal(true);
  };
  
  // Filtrar usuarios por búsqueda
  const filteredUsers = users 
    ? users.filter(user => 
        user.username.toLowerCase().includes(userSearch.toLowerCase()) ||
        user.email.toLowerCase().includes(userSearch.toLowerCase()) ||
        (user.full_name && user.full_name.toLowerCase().includes(userSearch.toLowerCase()))
      )
    : [];
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Panel Header */}
          <div className="mb-8 flex flex-wrap justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Panel de Administración</h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Gestión de usuarios, suscripciones y monitorización del sistema
              </p>
            </div>
          </div>
          
          {/* Verificar si es administrador */}
          {user && user.username === 'admin' ? (
            <Tabs defaultValue="dashboard" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-8">
                <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
                <TabsTrigger value="users">Usuarios</TabsTrigger>
                <TabsTrigger value="limits">Límites</TabsTrigger>
              </TabsList>
              
              {/* Dashboard Tab */}
              <TabsContent value="dashboard">
                {isLoadingStats ? (
                  <div className="py-20 text-center">
                    <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p className="text-lg text-gray-600 dark:text-gray-400">Cargando estadísticas...</p>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg flex items-center">
                            <Users className="mr-2 h-5 w-5 text-primary" />
                            Usuarios
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-3xl font-bold">{adminStats?.users.total_users || 0}</div>
                          <p className="text-sm text-gray-500 mt-1">
                            {adminStats?.users.new_users_last_7_days || 0} nuevos en los últimos 7 días
                          </p>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg flex items-center">
                            <MessageSquare className="mr-2 h-5 w-5 text-indigo-500" />
                            Conversaciones
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-3xl font-bold">{adminStats?.conversations.total_conversations || 0}</div>
                          <p className="text-sm text-gray-500 mt-1">
                            {adminStats?.conversations.new_conversations_last_7_days || 0} nuevas en los últimos 7 días
                          </p>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg flex items-center">
                            <Database className="mr-2 h-5 w-5 text-emerald-500" />
                            Tokens utilizados
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-3xl font-bold">{adminStats?.tokens.estimated_tokens_used.toLocaleString() || 0}</div>
                          <p className="text-sm text-gray-500 mt-1">
                            Coste estimado: ${adminStats?.tokens.estimated_cost_usd.toFixed(2) || '0.00'}
                          </p>
                        </CardContent>
                      </Card>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                      <Card>
                        <CardHeader>
                          <CardTitle>Distribución de Suscripciones</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div className="flex justify-between items-center">
                              <span>Free</span>
                              <span className="font-medium">{adminStats?.subscriptions.free_subscriptions || 0}</span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
                              <div 
                                className="bg-gray-400 h-full rounded-full" 
                                style={{ 
                                  width: `${adminStats ? (adminStats.subscriptions.free_subscriptions / adminStats.subscriptions.total_subscriptions * 100) : 0}%` 
                                }}
                              />
                            </div>
                            
                            <div className="flex justify-between items-center">
                              <span>Basic</span>
                              <span className="font-medium">{adminStats?.subscriptions.basic_subscriptions || 0}</span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
                              <div 
                                className="bg-blue-400 h-full rounded-full" 
                                style={{ 
                                  width: `${adminStats ? (adminStats.subscriptions.basic_subscriptions / adminStats.subscriptions.total_subscriptions * 100) : 0}%` 
                                }}
                              />
                            </div>
                            
                            <div className="flex justify-between items-center">
                              <span>Professional</span>
                              <span className="font-medium">{adminStats?.subscriptions.professional_subscriptions || 0}</span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
                              <div 
                                className="bg-indigo-500 h-full rounded-full" 
                                style={{ 
                                  width: `${adminStats ? (adminStats.subscriptions.professional_subscriptions / adminStats.subscriptions.total_subscriptions * 100) : 0}%` 
                                }}
                              />
                            </div>
                            
                            <div className="flex justify-between items-center">
                              <span>Enterprise</span>
                              <span className="font-medium">{adminStats?.subscriptions.enterprise_subscriptions || 0}</span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
                              <div 
                                className="bg-purple-600 h-full rounded-full" 
                                style={{ 
                                  width: `${adminStats ? (adminStats.subscriptions.enterprise_subscriptions / adminStats.subscriptions.total_subscriptions * 100) : 0}%` 
                                }}
                              />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardHeader>
                          <CardTitle>Estado del Sistema</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <div className="space-y-1">
                                <p className="text-sm font-medium leading-none">
                                  Mensajes totales
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {adminStats?.messages.assistant_messages || 0} respuestas AI / {adminStats?.messages.user_messages || 0} usuarios
                                </p>
                              </div>
                              <div className="text-2xl font-bold">
                                {adminStats?.messages.total_messages || 0}
                              </div>
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <div className="space-y-1">
                                <p className="text-sm font-medium leading-none">
                                  Tasa de resolución
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {adminStats?.conversations.resolved_conversations || 0} resueltas
                                </p>
                              </div>
                              <div className="text-2xl font-bold">
                                {adminStats && adminStats.conversations.total_conversations > 0 
                                  ? ((adminStats.conversations.resolved_conversations / adminStats.conversations.total_conversations) * 100).toFixed(1) 
                                  : 0}%
                              </div>
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <div className="space-y-1">
                                <p className="text-sm font-medium leading-none">
                                  Duración promedio
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  Tiempo de resolución de conversaciones
                                </p>
                              </div>
                              <div className="text-2xl font-bold">
                                {(adminStats?.conversations.avg_duration ? parseFloat(adminStats.conversations.avg_duration).toFixed(1) : '0')}s
                              </div>
                            </div>
                            
                            <div className="flex items-center justify-between pt-2">
                              <Button variant="outline" className="text-amber-600 flex items-center space-x-2" onClick={() => setActiveTab("limits")}>
                                <AlertTriangle className="h-4 w-4" />
                                <span>Usuarios cerca del límite</span>
                              </Button>
                              <div className="text-2xl font-bold text-amber-600">
                                {adminStats?.limits.users_near_limit || 0}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </>
                )}
              </TabsContent>
              
              {/* Users Tab */}
              <TabsContent value="users">
                <div className="mb-6 flex items-center justify-between">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Buscar usuarios..." 
                      className="pl-10"
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                    />
                  </div>
                  <Button 
                    onClick={() => setCreateUserModal(true)}
                    className="ml-4 flex items-center gap-2"
                  >
                    <UserPlus className="h-4 w-4" />
                    Crear Usuario
                  </Button>
                </div>
                
                {isLoadingUsers ? (
                  <div className="py-20 text-center">
                    <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p className="text-lg text-gray-600 dark:text-gray-400">Cargando usuarios...</p>
                  </div>
                ) : (
                  <Card>
                    <CardContent className="p-0">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>ID</TableHead>
                            <TableHead>Usuario</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Nombre</TableHead>
                            <TableHead>Fecha de creación</TableHead>
                            <TableHead>Acciones</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredUsers.length > 0 ? (
                            filteredUsers.map((user) => (
                              <TableRow key={user.id}>
                                <TableCell>{user.id}</TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <Avatar className="h-8 w-8">
                                      <AvatarFallback className="bg-primary text-white">
                                        {user.username.charAt(0).toUpperCase()}
                                      </AvatarFallback>
                                    </Avatar>
                                    <span className="font-medium">{user.username}</span>
                                  </div>
                                </TableCell>
                                <TableCell>{user.email}</TableCell>
                                <TableCell>{user.full_name || '-'}</TableCell>
                                <TableCell>{formatDate(user.created_at)}</TableCell>
                                <TableCell>
                                  <div className="flex gap-2">
                                    <Button 
                                      variant="ghost" 
                                      size="sm"
                                      onClick={() => handleViewUserDetails(user.id)}
                                    >
                                      <User className="h-4 w-4" />
                                    </Button>
                                    <Button 
                                      variant="ghost" 
                                      size="sm"
                                      onClick={() => handlePrepareEditUser(user)}
                                    >
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button 
                                      variant="ghost" 
                                      size="sm"
                                      onClick={() => handlePrepareEditSubscription(user.id)}
                                    >
                                      <CreditCard className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell colSpan={6} className="text-center py-10 text-gray-500">
                                {userSearch 
                                  ? "No se encontraron usuarios que coincidan con la búsqueda" 
                                  : "No hay usuarios registrados"}
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
              
              {/* Limits Tab */}
              <TabsContent value="limits">
                <Card className="mb-8">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center">
                      <AlertTriangle className="mr-2 h-5 w-5 text-amber-500" />
                      Usuarios cerca de su límite de uso
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    {isLoadingUsersNearLimit ? (
                      <div className="py-10 text-center">
                        <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                        <p className="text-lg text-gray-600 dark:text-gray-400">Cargando usuarios...</p>
                      </div>
                    ) : usersOverLimit.length > 0 ? (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Usuario</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Plan</TableHead>
                            <TableHead>Uso</TableHead>
                            <TableHead>Expiración</TableHead>
                            <TableHead>Acciones</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {usersOverLimit.map((user) => (
                            <TableRow key={user.id}>
                              <TableCell className="font-medium">{user.username}</TableCell>
                              <TableCell>{user.email}</TableCell>
                              <TableCell>
                                <span className={`px-2 py-1 rounded text-xs font-medium ${
                                  user.tier === 'free' ? 'bg-gray-100 text-gray-800' :
                                  user.tier === 'basic' ? 'bg-blue-100 text-blue-800' :
                                  user.tier === 'professional' ? 'bg-indigo-100 text-indigo-800' :
                                  'bg-purple-100 text-purple-800'
                                }`}>
                                  {user.tier.charAt(0).toUpperCase() + user.tier.slice(1)}
                                </span>
                              </TableCell>
                              <TableCell>
                                <div className="flex flex-col gap-1">
                                  <div className="flex justify-between text-xs">
                                    <span>{user.interactions_used} / {user.interactions_limit}</span>
                                    <span className={user.usage_percentage >= 100 ? "text-red-600 font-bold" : "text-amber-600"}>
                                      {user.usage_percentage}%
                                    </span>
                                  </div>
                                  <div className="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
                                    <div 
                                      className={`h-full rounded-full ${
                                        user.usage_percentage >= 100 ? "bg-red-600" : "bg-amber-500"
                                      }`}
                                      style={{ width: `${Math.min(user.usage_percentage, 100)}%` }}
                                    />
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                {user.end_date ? formatDate(user.end_date) : "Sin expiración"}
                              </TableCell>
                              <TableCell>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handlePrepareEditSubscription(user.id, {
                                    id: 0,
                                    tier: user.tier,
                                    status: user.status,
                                    interactions_limit: user.interactions_limit,
                                    interactions_used: user.interactions_used,
                                    created_at: "",
                                    start_date: "",
                                    end_date: user.end_date
                                  })}
                                >
                                  Editar suscripción
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    ) : (
                      <div className="py-10 text-center text-gray-500">
                        <p className="text-lg">No hay usuarios cercanos a su límite de uso</p>
                        <p className="text-sm mt-2">Todos los usuarios tienen suficientes interacciones disponibles</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          ) : (
            <div className="py-20 text-center">
              <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-lg text-gray-600 dark:text-gray-400">Verificando permisos de administrador...</p>
            </div>
          )}
        </div>
      </main>
      
      {/* Ver detalles de usuario modal */}
      <Dialog open={userDetailsModal} onOpenChange={setUserDetailsModal}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalles del Usuario</DialogTitle>
            <DialogDescription>
              Información detallada del usuario y sus actividades
            </DialogDescription>
          </DialogHeader>
          
          {isLoadingUserDetails ? (
            <div className="py-10 text-center">
              <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-lg text-gray-600 dark:text-gray-400">Cargando detalles...</p>
            </div>
          ) : userDetails ? (
            <div className="space-y-6">
              {/* Información del usuario */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Información del usuario</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">ID</p>
                      <p className="font-medium">{userDetails.user.id}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Nombre de usuario</p>
                      <p className="font-medium">{userDetails.user.username}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-medium">{userDetails.user.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Nombre completo</p>
                      <p className="font-medium">{userDetails.user.full_name || '-'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Fecha de creación</p>
                      <p className="font-medium">{formatDate(userDetails.user.created_at)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">API Key</p>
                      <p className="font-medium text-xs truncate">{userDetails.user.api_key}</p>
                    </div>
                  </div>
                  
                  <div className="mt-4 flex space-x-2">
                    <Button variant="outline" size="sm" onClick={() => handlePrepareEditUser(userDetails.user)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Editar usuario
                    </Button>
                  </div>
                </CardContent>
              </Card>
              
              {/* Suscripciones */}
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg">Suscripciones</CardTitle>
                    <Button variant="outline" size="sm" onClick={() => handlePrepareEditSubscription(userDetails.user.id, userDetails.subscriptions[0])}>
                      <CreditCard className="h-4 w-4 mr-2" />
                      Editar suscripción
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {userDetails.subscriptions.length > 0 ? (
                    <div className="space-y-4">
                      {userDetails.subscriptions.map((sub) => (
                        <div key={sub.id} className="border rounded-lg p-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm text-gray-500">Plan</p>
                              <p className="font-medium">{sub.tier.charAt(0).toUpperCase() + sub.tier.slice(1)}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Estado</p>
                              <p className={`font-medium ${
                                sub.status === 'active' ? 'text-green-600' : 'text-gray-600'
                              }`}>
                                {sub.status === 'active' ? 'Activo' : 'Inactivo'}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Uso de interacciones</p>
                              <div className="flex items-center space-x-2">
                                <div className="flex-1 bg-gray-200 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
                                  <div 
                                    className={`h-full rounded-full ${
                                      sub.interactions_used >= sub.interactions_limit ? "bg-red-600" :
                                      sub.interactions_used >= sub.interactions_limit * 0.8 ? "bg-amber-500" :
                                      "bg-primary"
                                    }`}
                                    style={{ 
                                      width: `${Math.min((sub.interactions_used / sub.interactions_limit) * 100, 100)}%` 
                                    }}
                                  />
                                </div>
                                <span className="text-sm font-medium">
                                  {sub.interactions_used} / {sub.interactions_limit}
                                </span>
                              </div>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Fecha de expiración</p>
                              <p className="font-medium">{sub.end_date ? formatDate(sub.end_date) : "Sin expiración"}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center py-4 text-gray-500">No tiene suscripciones activas</p>
                  )}
                </CardContent>
              </Card>
              
              {/* Estadísticas de uso */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Estadísticas de uso</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="border rounded-lg p-4 text-center">
                      <p className="text-sm text-gray-500">Conversaciones</p>
                      <p className="text-2xl font-bold">{userDetails.usage.total_conversations || 0}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {userDetails.usage.resolved_conversations || 0} resueltas
                      </p>
                    </div>
                    <div className="border rounded-lg p-4 text-center">
                      <p className="text-sm text-gray-500">Mensajes</p>
                      <p className="text-2xl font-bold">{userDetails.usage.total_messages || 0}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {userDetails.usage.user_messages || 0} usuarios / {userDetails.usage.assistant_messages || 0} AI
                      </p>
                    </div>
                    <div className="border rounded-lg p-4 text-center">
                      <p className="text-sm text-gray-500">Tokens estimados</p>
                      <p className="text-2xl font-bold">{userDetails.usage.estimated_tokens?.toLocaleString() || 0}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        ${(userDetails.usage.estimated_tokens / 1000000 * 5).toFixed(2)} estimados
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Integraciones */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Integraciones ({userDetails.integrations.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  {userDetails.integrations.length > 0 ? (
                    <div className="space-y-4">
                      {userDetails.integrations.map((integration) => (
                        <div key={integration.id} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center">
                              <div 
                                className="w-3 h-3 rounded-full mr-2" 
                                style={{ backgroundColor: integration.theme_color || '#3B82F6' }}
                              />
                              <h3 className="font-medium">{integration.name}</h3>
                            </div>
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              integration.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                            }`}>
                              {integration.active ? 'Activo' : 'Inactivo'}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 truncate mb-2">{integration.url}</p>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <span className="text-gray-500">Visitantes:</span> {integration.visitor_count || 0}
                            </div>
                            <div>
                              <span className="text-gray-500">Tipo de widget:</span> {integration.widget_type || 'Flotante'}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center py-4 text-gray-500">No tiene integraciones configuradas</p>
                  )}
                </CardContent>
              </Card>
              
              {/* Conversaciones recientes */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Conversaciones recientes ({userDetails.recentConversations.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  {userDetails.recentConversations.length > 0 ? (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>ID</TableHead>
                            <TableHead>Integración</TableHead>
                            <TableHead>Estado</TableHead>
                            <TableHead>Duración</TableHead>
                            <TableHead>Fecha</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {userDetails.recentConversations.map((conv) => (
                            <TableRow key={conv.id}>
                              <TableCell className="font-medium">{conv.id}</TableCell>
                              <TableCell>{conv.integration_name}</TableCell>
                              <TableCell>
                                <span className={`px-2 py-1 rounded-full text-xs ${
                                  conv.resolved ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                                }`}>
                                  {conv.resolved ? 'Resuelta' : 'Pendiente'}
                                </span>
                              </TableCell>
                              <TableCell>{conv.duration}s</TableCell>
                              <TableCell>{formatDate(conv.created_at)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <p className="text-center py-4 text-gray-500">No tiene conversaciones registradas</p>
                  )}
                </CardContent>
              </Card>
            </div>
          ) : (
            <p className="text-center py-4 text-gray-500">No se pudo cargar la información del usuario</p>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setUserDetailsModal(false)}>
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Crear usuario modal */}
      <Dialog open={createUserModal} onOpenChange={setCreateUserModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Crear nuevo usuario</DialogTitle>
            <DialogDescription>
              Introduce la información del nuevo usuario
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleCreateUser}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="username">Nombre de usuario</Label>
                <Input 
                  id="username" 
                  value={newUser.username}
                  onChange={(e) => setNewUser({...newUser, username: e.target.value})}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <Input 
                  id="password" 
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="fullName">Nombre completo</Label>
                <Input 
                  id="fullName" 
                  value={newUser.fullName}
                  onChange={(e) => setNewUser({...newUser, fullName: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="tier">Plan de suscripción</Label>
                <Select
                  value={newUser.tier}
                  onValueChange={(value) => setNewUser({...newUser, tier: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar plan" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="free">Gratuito</SelectItem>
                      <SelectItem value="basic">Básico</SelectItem>
                      <SelectItem value="professional">Profesional</SelectItem>
                      <SelectItem value="enterprise">Enterprise</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setCreateUserModal(false)}>
                Cancelar
              </Button>
              <Button type="submit">Crear usuario</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Editar usuario modal */}
      <Dialog open={editUserModal} onOpenChange={setEditUserModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar usuario</DialogTitle>
            <DialogDescription>
              Modifica la información del usuario ID: {editUserData.id}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleEditUser}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-username">Nombre de usuario</Label>
                <Input 
                  id="edit-username" 
                  value={editUserData.username}
                  onChange={(e) => setEditUserData({...editUserData, username: e.target.value})}
                  placeholder="Mantener actual"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-email">Email</Label>
                <Input 
                  id="edit-email" 
                  type="email"
                  value={editUserData.email}
                  onChange={(e) => setEditUserData({...editUserData, email: e.target.value})}
                  placeholder="Mantener actual"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-fullName">Nombre completo</Label>
                <Input 
                  id="edit-fullName" 
                  value={editUserData.fullName}
                  onChange={(e) => setEditUserData({...editUserData, fullName: e.target.value})}
                  placeholder="Mantener actual"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-password">Nueva contraseña</Label>
                <Input 
                  id="edit-password" 
                  type="password"
                  value={editUserData.password}
                  onChange={(e) => setEditUserData({...editUserData, password: e.target.value})}
                  placeholder="Dejar en blanco para mantener actual"
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditUserModal(false)}>
                Cancelar
              </Button>
              <Button type="submit">Guardar cambios</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Editar suscripción modal */}
      <Dialog open={subscriptionModal} onOpenChange={setSubscriptionModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar suscripción</DialogTitle>
            <DialogDescription>
              Modifica la suscripción del usuario ID: {editSubscriptionData.userId}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleEditSubscription}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="subscription-tier">Plan</Label>
                <Select
                  value={editSubscriptionData.tier}
                  onValueChange={(value) => setEditSubscriptionData({...editSubscriptionData, tier: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar plan" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="free">Gratuito</SelectItem>
                      <SelectItem value="basic">Básico</SelectItem>
                      <SelectItem value="professional">Profesional</SelectItem>
                      <SelectItem value="enterprise">Enterprise</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="subscription-status">Estado</Label>
                <Select
                  value={editSubscriptionData.status}
                  onValueChange={(value) => setEditSubscriptionData({...editSubscriptionData, status: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="active">Activo</SelectItem>
                      <SelectItem value="inactive">Inactivo</SelectItem>
                      <SelectItem value="expired">Expirado</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="subscription-limit">Límite de interacciones</Label>
                <Input 
                  id="subscription-limit" 
                  type="number"
                  min="0"
                  value={editSubscriptionData.interactionsLimit}
                  onChange={(e) => setEditSubscriptionData({
                    ...editSubscriptionData, 
                    interactionsLimit: parseInt(e.target.value) || 0
                  })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="subscription-end-date">Fecha de expiración</Label>
                <Input 
                  id="subscription-end-date" 
                  type="date"
                  value={editSubscriptionData.endDate}
                  onChange={(e) => setEditSubscriptionData({...editSubscriptionData, endDate: e.target.value})}
                />
                <p className="text-xs text-gray-500">Dejar en blanco para una suscripción sin fecha de expiración</p>
              </div>
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setSubscriptionModal(false)}>
                Cancelar
              </Button>
              <Button type="submit">Guardar cambios</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      <Footer />
    </div>
  );
}