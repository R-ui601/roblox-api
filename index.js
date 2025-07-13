require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();
app.use(cors());
app.use(express.json());

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

app.post('/guardar-datos', async (req, res) => {
  const { id, monedas } = req.body;

  if (!id || monedas == null) {
    return res.status(400).json({ error: 'Faltan parámetros id o monedas' });
  }

  const { error } = await supabase
    .from('jugadores')
    .upsert({ id, monedas }, { onConflict: 'id' });

  if (error) {
    console.error('Error guardando datos:', error);
    return res.status(500).json({ error: error.message });
  }

  res.json({ success: true });
});

app.get('/obtener-datos/:id', async (req, res) => {
  const { id } = req.params;

  console.log("Recibí GET para id:", id);

  if (!id) {
    return res.status(400).json({ error: 'Falta parámetro id' });
  }

  const { data, error } = await supabase
    .from('jugadores')
    .select('monedas')
    .eq('id', id)
    .single();

  // Aquí ignoramos error de "no encontrado" para devolver 0 monedas
  if (error && error.code !== 'PGRST116') {
    console.error('Error obteniendo datos:', error);
    return res.status(500).json({ error: error.message });
  }

  res.json({ monedas: data ? data.monedas : 0 });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Servidor funcionando en el puerto ${port}`);
});
