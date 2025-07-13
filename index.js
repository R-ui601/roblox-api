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

  const { error } = await supabase
    .from('jugadores')
    .upsert({ id, monedas }, { onConflict: 'id' });

  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true });
});

app.get('/obtener-datos/:id', async (req, res) => {
  const { id } = req.params;

  const { data, error } = await supabase
    .from('jugadores')
    .select('monedas')
    .eq('id', id)
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.json({ monedas: data.monedas });
});

app.listen(process.env.PORT || 3000, () => {
  console.log('Servidor funcionando en el puerto 3000');
});
