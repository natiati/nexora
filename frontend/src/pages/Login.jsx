import { useState } from 'react';

export default function Login() {
const [email, setEmail] = useState('');
const [password, setPassword] = useState('');

const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Login (aún sin conectar):', { email, password });
};

return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
    <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md w-80">
        <h1 className="text-xl font-bold mb-4 text-center">Nexora</h1>

        <input
        type="email"
         placeholder="Correo"
         value={email}
         onChange={(e) => setEmail(e.target.value)} 
         className="w-full border rounded p-2 mb-3"
        />

        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border rounded p-2 mb-4"
        />

        <button
        type="submit"
        className="w-full bg-blue-600 text-white rounded p-2"
        >
          Ingresar
        </button>
      </form>
    </div>
  );
}
