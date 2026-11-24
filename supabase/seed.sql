-- meuPet: prestadores FICTÍCIOS para demonstração (gerado a partir de src/lib/seed.ts).
-- Rode depois das migrações. Pode rodar de novo enquanto ninguém tiver agendado com eles: apaga e recria só estes prestadores.
begin;
delete from public.prestadores where id in ('42fcd9fa-19bc-4bff-a3dc-4a7e282899b8', '46a7838f-39e2-4135-afee-ad364bf0856e', '30914b13-48c3-409d-a16d-ae2e442063a7', '2f955f45-d069-40eb-a8bf-d15ecf4d00fa', '5b540b8c-3626-4001-ad2c-4b6cb86b73e1', 'b10dc682-582a-46fb-abf0-892f0d8112ab', '7eb0468a-5498-458b-a670-517840a08fc4', '4b10f564-8a53-4878-a509-bdbffd339efc', '711744fc-8722-409f-aadf-6701e9ef43e2', 'd898f5e8-e966-4a2a-a78a-473adf0e8e44', '1b12f9d0-a87a-46e5-ac1d-016c7480bb15', '99a952ff-12ca-4d81-a5f1-0bdb6c160657', 'bff47848-a10e-4647-a60e-6ba3b55f1c94', '3f2e0ded-cc3c-4211-a1f6-683a153783de', 'effbc03e-da25-4444-a656-613aa34a56c2', '6768db63-d4d0-4995-ad8e-e7edb247777e', '0f72c0cd-f5c0-4045-a999-7bd4bb710241', 'df9f37bc-cbac-410b-a318-b35fd1992582', '5b6b96c0-d498-493c-a88b-0cdcedd6ca04');

-- Bicho Cheiroso
insert into public.prestadores (id, slug, nome, tipos, descricao, endereco, bairro, telefone, lat, lng, passo_min, limpeza_min, antecedencia_min, janela_cancelamento_h, pagamentos, cor, emoji) values ('42fcd9fa-19bc-4bff-a3dc-4a7e282899b8', 'bicho-cheiroso-rio-negro', 'Bicho Cheiroso', '{"banho_tosa","petshop"}', 'Banho e tosa com secagem silenciosa e espaço separado para gatos.', 'Alameda Rio Negro, 1030 – loja 12', 'Alphaville, Barueri', '(11) 4191-0001', -23.4979, -46.8501, 30, 15, 120, 2, '{"Pix","Cartão de crédito","Cartão de débito"}', '#0ea5e9', '🛁');
insert into public.profissionais (id, prestador_id, nome, ordem) values ('e81f0b3c-255d-42df-a0f1-f420bc09b167', '42fcd9fa-19bc-4bff-a3dc-4a7e282899b8', 'Carla', 0), ('3a087c78-6a4b-4f03-abb9-bcbdc5156d25', '42fcd9fa-19bc-4bff-a3dc-4a7e282899b8', 'Joana', 1);
insert into public.horarios (prestador_id, dia_semana, abre_min, fecha_min) values ('42fcd9fa-19bc-4bff-a3dc-4a7e282899b8', 1, 480, 1080), ('42fcd9fa-19bc-4bff-a3dc-4a7e282899b8', 2, 480, 1080), ('42fcd9fa-19bc-4bff-a3dc-4a7e282899b8', 3, 480, 1080), ('42fcd9fa-19bc-4bff-a3dc-4a7e282899b8', 4, 480, 1080), ('42fcd9fa-19bc-4bff-a3dc-4a7e282899b8', 5, 480, 1080), ('42fcd9fa-19bc-4bff-a3dc-4a7e282899b8', 6, 480, 840);
insert into public.servicos (id, prestador_id, nome, tipo, especies, preco_a_partir, ativo) values ('abeb8e02-2da5-4b21-a83d-ecf76ecab6cb', '42fcd9fa-19bc-4bff-a3dc-4a7e282899b8', 'Banho', 'banho_tosa', '{"cao","gato"}', false, true);
insert into public.servico_portes (servico_id, porte, duracao_min, preco) values ('abeb8e02-2da5-4b21-a83d-ecf76ecab6cb', 'mini', 45, 65), ('abeb8e02-2da5-4b21-a83d-ecf76ecab6cb', 'pequeno', 60, 75), ('abeb8e02-2da5-4b21-a83d-ecf76ecab6cb', 'medio', 75, 90), ('abeb8e02-2da5-4b21-a83d-ecf76ecab6cb', 'grande', 90, 110), ('abeb8e02-2da5-4b21-a83d-ecf76ecab6cb', 'gigante', 120, 135);
insert into public.servicos (id, prestador_id, nome, tipo, especies, preco_a_partir, ativo) values ('c01e62bc-b1c8-4f4f-a013-0dc8ecbcc8c1', '42fcd9fa-19bc-4bff-a3dc-4a7e282899b8', 'Banho e tosa', 'banho_tosa', '{"cao","gato"}', false, true);
insert into public.servico_portes (servico_id, porte, duracao_min, preco) values ('c01e62bc-b1c8-4f4f-a013-0dc8ecbcc8c1', 'mini', 75, 95), ('c01e62bc-b1c8-4f4f-a013-0dc8ecbcc8c1', 'pequeno', 90, 110), ('c01e62bc-b1c8-4f4f-a013-0dc8ecbcc8c1', 'medio', 105, 130), ('c01e62bc-b1c8-4f4f-a013-0dc8ecbcc8c1', 'grande', 120, 155), ('c01e62bc-b1c8-4f4f-a013-0dc8ecbcc8c1', 'gigante', 150, 185);
insert into public.servicos (id, prestador_id, nome, tipo, especies, preco_a_partir, ativo) values ('5f10fe84-715d-4939-aca4-f6489d8c9595', '42fcd9fa-19bc-4bff-a3dc-4a7e282899b8', 'Tosa higiênica', 'banho_tosa', '{"cao","gato"}', false, true);
insert into public.servico_portes (servico_id, porte, duracao_min, preco) values ('5f10fe84-715d-4939-aca4-f6489d8c9595', 'mini', 30, 40), ('5f10fe84-715d-4939-aca4-f6489d8c9595', 'pequeno', 30, 40), ('5f10fe84-715d-4939-aca4-f6489d8c9595', 'medio', 30, 40), ('5f10fe84-715d-4939-aca4-f6489d8c9595', 'grande', 30, 40), ('5f10fe84-715d-4939-aca4-f6489d8c9595', 'gigante', 30, 40);
insert into public.servicos (id, prestador_id, nome, tipo, especies, preco_a_partir, ativo) values ('c6eec33a-26f2-41e7-a2b9-d49258422bc6', '42fcd9fa-19bc-4bff-a3dc-4a7e282899b8', 'Hidratação de pelos', 'petshop', '{"cao","gato"}', false, true);
insert into public.servico_portes (servico_id, porte, duracao_min, preco) values ('c6eec33a-26f2-41e7-a2b9-d49258422bc6', 'mini', 30, 35), ('c6eec33a-26f2-41e7-a2b9-d49258422bc6', 'pequeno', 30, 35), ('c6eec33a-26f2-41e7-a2b9-d49258422bc6', 'medio', 30, 45), ('c6eec33a-26f2-41e7-a2b9-d49258422bc6', 'grande', 30, 55), ('c6eec33a-26f2-41e7-a2b9-d49258422bc6', 'gigante', 30, 65);
insert into public.servicos (id, prestador_id, nome, tipo, especies, preco_a_partir, ativo) values ('694456fd-e03d-4afb-ace1-22ea5e866684', '42fcd9fa-19bc-4bff-a3dc-4a7e282899b8', 'Corte de unhas', 'petshop', '{"cao","gato"}', false, true);
insert into public.servico_portes (servico_id, porte, duracao_min, preco) values ('694456fd-e03d-4afb-ace1-22ea5e866684', 'mini', 15, 20), ('694456fd-e03d-4afb-ace1-22ea5e866684', 'pequeno', 15, 20), ('694456fd-e03d-4afb-ace1-22ea5e866684', 'medio', 15, 20), ('694456fd-e03d-4afb-ace1-22ea5e866684', 'grande', 15, 20), ('694456fd-e03d-4afb-ace1-22ea5e866684', 'gigante', 15, 20);

-- Clínica Vet Alpha Care
insert into public.prestadores (id, slug, nome, tipos, descricao, endereco, bairro, telefone, lat, lng, passo_min, limpeza_min, antecedencia_min, janela_cancelamento_h, pagamentos, cor, emoji) values ('46a7838f-39e2-4135-afee-ad364bf0856e', 'clinica-vet-alpha-care', 'Clínica Vet Alpha Care', '{"veterinario"}', 'Clínica geral, vacinas e exames. Atende cães, gatos e pets não convencionais.', 'Alameda Araguaia, 750', 'Alphaville, Barueri', '(11) 4191-0002', -23.5013, -46.8462, 15, 0, 120, 12, '{"Pix","Cartão de crédito","Cartão de débito"}', '#ef4444', '🩺');
insert into public.profissionais (id, prestador_id, nome, ordem) values ('38a5ad4e-b45c-44df-a549-3d1737a73522', '46a7838f-39e2-4135-afee-ad364bf0856e', 'Dra. Paula', 0), ('fb9e3a74-208f-41eb-a04d-77e42bf6cf35', '46a7838f-39e2-4135-afee-ad364bf0856e', 'Dr. Renato', 1);
insert into public.horarios (prestador_id, dia_semana, abre_min, fecha_min) values ('46a7838f-39e2-4135-afee-ad364bf0856e', 0, 540, 780), ('46a7838f-39e2-4135-afee-ad364bf0856e', 1, 480, 1200), ('46a7838f-39e2-4135-afee-ad364bf0856e', 2, 480, 1200), ('46a7838f-39e2-4135-afee-ad364bf0856e', 3, 480, 1200), ('46a7838f-39e2-4135-afee-ad364bf0856e', 4, 480, 1200), ('46a7838f-39e2-4135-afee-ad364bf0856e', 5, 480, 1200), ('46a7838f-39e2-4135-afee-ad364bf0856e', 6, 480, 960);
insert into public.servicos (id, prestador_id, nome, tipo, especies, preco_a_partir, ativo) values ('1b43acfd-5a21-48f5-a3db-e232f3dcdfda', '46a7838f-39e2-4135-afee-ad364bf0856e', 'Consulta clínica', 'veterinario', '{"cao","gato","outro"}', false, true);
insert into public.servico_portes (servico_id, porte, duracao_min, preco) values ('1b43acfd-5a21-48f5-a3db-e232f3dcdfda', 'mini', 30, 220), ('1b43acfd-5a21-48f5-a3db-e232f3dcdfda', 'pequeno', 30, 220), ('1b43acfd-5a21-48f5-a3db-e232f3dcdfda', 'medio', 30, 220), ('1b43acfd-5a21-48f5-a3db-e232f3dcdfda', 'grande', 30, 220), ('1b43acfd-5a21-48f5-a3db-e232f3dcdfda', 'gigante', 30, 220);
insert into public.servicos (id, prestador_id, nome, tipo, especies, preco_a_partir, ativo) values ('3048e073-9a4d-4af9-a630-4a93bd077d1e', '46a7838f-39e2-4135-afee-ad364bf0856e', 'Vacinação', 'veterinario', '{"cao","gato"}', true, true);
insert into public.servico_portes (servico_id, porte, duracao_min, preco) values ('3048e073-9a4d-4af9-a630-4a93bd077d1e', 'mini', 15, 110), ('3048e073-9a4d-4af9-a630-4a93bd077d1e', 'pequeno', 15, 110), ('3048e073-9a4d-4af9-a630-4a93bd077d1e', 'medio', 15, 110), ('3048e073-9a4d-4af9-a630-4a93bd077d1e', 'grande', 15, 110), ('3048e073-9a4d-4af9-a630-4a93bd077d1e', 'gigante', 15, 110);
insert into public.servicos (id, prestador_id, nome, tipo, especies, preco_a_partir, ativo) values ('ecc095ff-1f36-4317-a9d4-88eddc9bd125', '46a7838f-39e2-4135-afee-ad364bf0856e', 'Retorno de consulta', 'veterinario', '{"cao","gato"}', false, true);
insert into public.servico_portes (servico_id, porte, duracao_min, preco) values ('ecc095ff-1f36-4317-a9d4-88eddc9bd125', 'mini', 15, 0), ('ecc095ff-1f36-4317-a9d4-88eddc9bd125', 'pequeno', 15, 0), ('ecc095ff-1f36-4317-a9d4-88eddc9bd125', 'medio', 15, 0), ('ecc095ff-1f36-4317-a9d4-88eddc9bd125', 'grande', 15, 0), ('ecc095ff-1f36-4317-a9d4-88eddc9bd125', 'gigante', 15, 0);
insert into public.servicos (id, prestador_id, nome, tipo, especies, preco_a_partir, ativo) values ('ad15602c-e27f-45d1-af58-38cadf090529', '46a7838f-39e2-4135-afee-ad364bf0856e', 'Exames de sangue (coleta)', 'veterinario', '{"cao","gato"}', true, true);
insert into public.servico_portes (servico_id, porte, duracao_min, preco) values ('ad15602c-e27f-45d1-af58-38cadf090529', 'mini', 15, null), ('ad15602c-e27f-45d1-af58-38cadf090529', 'pequeno', 15, null), ('ad15602c-e27f-45d1-af58-38cadf090529', 'medio', 15, null), ('ad15602c-e27f-45d1-af58-38cadf090529', 'grande', 15, null), ('ad15602c-e27f-45d1-af58-38cadf090529', 'gigante', 15, null);

-- Tosa da Vila
insert into public.prestadores (id, slug, nome, tipos, descricao, endereco, bairro, telefone, lat, lng, passo_min, limpeza_min, antecedencia_min, janela_cancelamento_h, pagamentos, cor, emoji) values ('30914b13-48c3-409d-a16d-ae2e442063a7', 'tosa-da-vila', 'Tosa da Vila', '{"banho_tosa"}', 'Especialista em tosa na tesoura e raças de pelo longo.', 'Av. Copacabana, 112', 'Alphaville, Barueri', '(11) 4191-0003', -23.4931, -46.8546, 30, 15, 120, 2, '{"Pix","Cartão de crédito","Cartão de débito"}', '#0ea5e9', '🛁');
insert into public.profissionais (id, prestador_id, nome, ordem) values ('4c8f8a72-4b58-49ec-a55b-6fa19797f406', '30914b13-48c3-409d-a16d-ae2e442063a7', 'Marcos', 0);
insert into public.horarios (prestador_id, dia_semana, abre_min, fecha_min) values ('30914b13-48c3-409d-a16d-ae2e442063a7', 1, 480, 1080), ('30914b13-48c3-409d-a16d-ae2e442063a7', 2, 480, 1080), ('30914b13-48c3-409d-a16d-ae2e442063a7', 3, 480, 1080), ('30914b13-48c3-409d-a16d-ae2e442063a7', 4, 480, 1080), ('30914b13-48c3-409d-a16d-ae2e442063a7', 5, 480, 1080), ('30914b13-48c3-409d-a16d-ae2e442063a7', 6, 480, 960);
insert into public.servicos (id, prestador_id, nome, tipo, especies, preco_a_partir, ativo) values ('4b5d8fc3-a129-4fe1-a365-5bb4076f9326', '30914b13-48c3-409d-a16d-ae2e442063a7', 'Banho', 'banho_tosa', '{"cao","gato"}', false, true);
insert into public.servico_portes (servico_id, porte, duracao_min, preco) values ('4b5d8fc3-a129-4fe1-a365-5bb4076f9326', 'mini', 45, 70), ('4b5d8fc3-a129-4fe1-a365-5bb4076f9326', 'pequeno', 60, 80), ('4b5d8fc3-a129-4fe1-a365-5bb4076f9326', 'medio', 75, 95), ('4b5d8fc3-a129-4fe1-a365-5bb4076f9326', 'grande', 90, 115), ('4b5d8fc3-a129-4fe1-a365-5bb4076f9326', 'gigante', 120, 140);
insert into public.servicos (id, prestador_id, nome, tipo, especies, preco_a_partir, ativo) values ('a204743a-3200-49f0-a615-0b510e80f792', '30914b13-48c3-409d-a16d-ae2e442063a7', 'Banho e tosa', 'banho_tosa', '{"cao","gato"}', false, true);
insert into public.servico_portes (servico_id, porte, duracao_min, preco) values ('a204743a-3200-49f0-a615-0b510e80f792', 'mini', 75, 110), ('a204743a-3200-49f0-a615-0b510e80f792', 'pequeno', 90, 125), ('a204743a-3200-49f0-a615-0b510e80f792', 'medio', 105, 145), ('a204743a-3200-49f0-a615-0b510e80f792', 'grande', 120, 170), ('a204743a-3200-49f0-a615-0b510e80f792', 'gigante', 150, 200);
insert into public.servicos (id, prestador_id, nome, tipo, especies, preco_a_partir, ativo) values ('865a28cf-eb18-4c7e-a948-6469e73b24d8', '30914b13-48c3-409d-a16d-ae2e442063a7', 'Tosa higiênica', 'banho_tosa', '{"cao","gato"}', false, true);
insert into public.servico_portes (servico_id, porte, duracao_min, preco) values ('865a28cf-eb18-4c7e-a948-6469e73b24d8', 'mini', 30, 45), ('865a28cf-eb18-4c7e-a948-6469e73b24d8', 'pequeno', 30, 45), ('865a28cf-eb18-4c7e-a948-6469e73b24d8', 'medio', 30, 45), ('865a28cf-eb18-4c7e-a948-6469e73b24d8', 'grande', 30, 45), ('865a28cf-eb18-4c7e-a948-6469e73b24d8', 'gigante', 30, 45);

-- Patas & Cia
insert into public.prestadores (id, slug, nome, tipos, descricao, endereco, bairro, telefone, lat, lng, passo_min, limpeza_min, antecedencia_min, janela_cancelamento_h, pagamentos, cor, emoji) values ('2f955f45-d069-40eb-a8bf-d15ecf4d00fa', 'patas-e-cia-tambore', 'Patas & Cia', '{"petshop","banho_tosa"}', 'Pet shop completo com banho e tosa e entrega de ração.', 'Av. Marcos Penteado de Ulhôa Rodrigues, 939', 'Tamboré, Barueri', '(11) 4191-0004', -23.5002, -46.8365, 30, 15, 120, 2, '{"Pix","Cartão de crédito","Cartão de débito"}', '#f59e0b', '🦴');
insert into public.profissionais (id, prestador_id, nome, ordem) values ('8c5d88ea-9963-4436-a6b2-f33acb741dce', '2f955f45-d069-40eb-a8bf-d15ecf4d00fa', 'Bia', 0), ('3912ae33-7606-4899-afe7-adb8ad2b6161', '2f955f45-d069-40eb-a8bf-d15ecf4d00fa', 'Rafa', 1), ('80068b5d-a156-4e84-a6f1-79a7aa633b41', '2f955f45-d069-40eb-a8bf-d15ecf4d00fa', 'Lu', 2);
insert into public.horarios (prestador_id, dia_semana, abre_min, fecha_min) values ('2f955f45-d069-40eb-a8bf-d15ecf4d00fa', 0, 540, 840), ('2f955f45-d069-40eb-a8bf-d15ecf4d00fa', 1, 540, 1140), ('2f955f45-d069-40eb-a8bf-d15ecf4d00fa', 2, 540, 1140), ('2f955f45-d069-40eb-a8bf-d15ecf4d00fa', 3, 540, 1140), ('2f955f45-d069-40eb-a8bf-d15ecf4d00fa', 4, 540, 1140), ('2f955f45-d069-40eb-a8bf-d15ecf4d00fa', 5, 540, 1140), ('2f955f45-d069-40eb-a8bf-d15ecf4d00fa', 6, 540, 1020);
insert into public.servicos (id, prestador_id, nome, tipo, especies, preco_a_partir, ativo) values ('65b49bd4-9f2b-4022-ae83-6595f7607af2', '2f955f45-d069-40eb-a8bf-d15ecf4d00fa', 'Banho', 'banho_tosa', '{"cao","gato"}', false, true);
insert into public.servico_portes (servico_id, porte, duracao_min, preco) values ('65b49bd4-9f2b-4022-ae83-6595f7607af2', 'mini', 45, 60), ('65b49bd4-9f2b-4022-ae83-6595f7607af2', 'pequeno', 60, 70), ('65b49bd4-9f2b-4022-ae83-6595f7607af2', 'medio', 75, 85), ('65b49bd4-9f2b-4022-ae83-6595f7607af2', 'grande', 90, 105), ('65b49bd4-9f2b-4022-ae83-6595f7607af2', 'gigante', 120, 130);
insert into public.servicos (id, prestador_id, nome, tipo, especies, preco_a_partir, ativo) values ('6b4b1a30-a65e-4684-a597-3e3d8c082ed7', '2f955f45-d069-40eb-a8bf-d15ecf4d00fa', 'Banho e tosa', 'banho_tosa', '{"cao","gato"}', false, true);
insert into public.servico_portes (servico_id, porte, duracao_min, preco) values ('6b4b1a30-a65e-4684-a597-3e3d8c082ed7', 'mini', 75, 90), ('6b4b1a30-a65e-4684-a597-3e3d8c082ed7', 'pequeno', 90, 105), ('6b4b1a30-a65e-4684-a597-3e3d8c082ed7', 'medio', 105, 125), ('6b4b1a30-a65e-4684-a597-3e3d8c082ed7', 'grande', 120, 150), ('6b4b1a30-a65e-4684-a597-3e3d8c082ed7', 'gigante', 150, 180);
insert into public.servicos (id, prestador_id, nome, tipo, especies, preco_a_partir, ativo) values ('d21f836d-af5c-4def-aacc-2e287cc96cbb', '2f955f45-d069-40eb-a8bf-d15ecf4d00fa', 'Corte de unhas', 'petshop', '{"cao","gato"}', false, true);
insert into public.servico_portes (servico_id, porte, duracao_min, preco) values ('d21f836d-af5c-4def-aacc-2e287cc96cbb', 'mini', 15, 15), ('d21f836d-af5c-4def-aacc-2e287cc96cbb', 'pequeno', 15, 15), ('d21f836d-af5c-4def-aacc-2e287cc96cbb', 'medio', 15, 15), ('d21f836d-af5c-4def-aacc-2e287cc96cbb', 'grande', 15, 15), ('d21f836d-af5c-4def-aacc-2e287cc96cbb', 'gigante', 15, 15);
insert into public.servicos (id, prestador_id, nome, tipo, especies, preco_a_partir, ativo) values ('259fef9d-7f0b-4ecd-a519-7337c5bf4f43', '2f955f45-d069-40eb-a8bf-d15ecf4d00fa', 'Hidratação de pelos', 'petshop', '{"cao","gato"}', false, true);
insert into public.servico_portes (servico_id, porte, duracao_min, preco) values ('259fef9d-7f0b-4ecd-a519-7337c5bf4f43', 'mini', 30, 30), ('259fef9d-7f0b-4ecd-a519-7337c5bf4f43', 'pequeno', 30, 30), ('259fef9d-7f0b-4ecd-a519-7337c5bf4f43', 'medio', 30, 40), ('259fef9d-7f0b-4ecd-a519-7337c5bf4f43', 'grande', 30, 50), ('259fef9d-7f0b-4ecd-a519-7337c5bf4f43', 'gigante', 30, 60);

-- AdestrAlpha
insert into public.prestadores (id, slug, nome, tipos, descricao, endereco, bairro, telefone, lat, lng, passo_min, limpeza_min, antecedencia_min, janela_cancelamento_h, pagamentos, cor, emoji) values ('5b540b8c-3626-4001-ad2c-4b6cb86b73e1', 'adestra-alpha', 'AdestrAlpha', '{"adestramento"}', 'Adestramento positivo, filhotes e correção de comportamento.', 'Calçada das Margaridas, 163', 'Alphaville, Barueri', '(11) 4191-0005', -23.4888, -46.8478, 30, 30, 120, 24, '{"Pix","Cartão de crédito","Cartão de débito"}', '#8b5cf6', '🎾');
insert into public.profissionais (id, prestador_id, nome, ordem) values ('ae90c5ce-886d-4c8b-a1a7-1a3c751bbe74', '5b540b8c-3626-4001-ad2c-4b6cb86b73e1', 'Tiago', 0);
insert into public.horarios (prestador_id, dia_semana, abre_min, fecha_min) values ('5b540b8c-3626-4001-ad2c-4b6cb86b73e1', 1, 420, 720), ('5b540b8c-3626-4001-ad2c-4b6cb86b73e1', 2, 420, 720), ('5b540b8c-3626-4001-ad2c-4b6cb86b73e1', 3, 420, 720), ('5b540b8c-3626-4001-ad2c-4b6cb86b73e1', 4, 420, 720), ('5b540b8c-3626-4001-ad2c-4b6cb86b73e1', 5, 420, 720), ('5b540b8c-3626-4001-ad2c-4b6cb86b73e1', 6, 480, 720);
insert into public.servicos (id, prestador_id, nome, tipo, especies, preco_a_partir, ativo) values ('bf9c66f5-9ca6-43a3-ab36-428c9a140e06', '5b540b8c-3626-4001-ad2c-4b6cb86b73e1', 'Aula de adestramento', 'adestramento', '{"cao"}', false, true);
insert into public.servico_portes (servico_id, porte, duracao_min, preco) values ('bf9c66f5-9ca6-43a3-ab36-428c9a140e06', 'mini', 60, 180), ('bf9c66f5-9ca6-43a3-ab36-428c9a140e06', 'pequeno', 60, 180), ('bf9c66f5-9ca6-43a3-ab36-428c9a140e06', 'medio', 60, 180), ('bf9c66f5-9ca6-43a3-ab36-428c9a140e06', 'grande', 60, 180), ('bf9c66f5-9ca6-43a3-ab36-428c9a140e06', 'gigante', 60, 180);
insert into public.servicos (id, prestador_id, nome, tipo, especies, preco_a_partir, ativo) values ('fe504c02-7651-4b4a-a6a7-916ea04279c0', '5b540b8c-3626-4001-ad2c-4b6cb86b73e1', 'Avaliação comportamental', 'adestramento', '{"cao"}', false, true);
insert into public.servico_portes (servico_id, porte, duracao_min, preco) values ('fe504c02-7651-4b4a-a6a7-916ea04279c0', 'mini', 45, 150), ('fe504c02-7651-4b4a-a6a7-916ea04279c0', 'pequeno', 45, 150), ('fe504c02-7651-4b4a-a6a7-916ea04279c0', 'medio', 45, 150), ('fe504c02-7651-4b4a-a6a7-916ea04279c0', 'grande', 45, 150), ('fe504c02-7651-4b4a-a6a7-916ea04279c0', 'gigante', 45, 150);

-- Hospital Vet Tamboré
insert into public.prestadores (id, slug, nome, tipos, descricao, endereco, bairro, telefone, lat, lng, passo_min, limpeza_min, antecedencia_min, janela_cancelamento_h, pagamentos, cor, emoji) values ('b10dc682-582a-46fb-abf0-892f0d8112ab', 'vet-24-tambore', 'Hospital Vet Tamboré', '{"veterinario"}', 'Consultas com hora marcada, vacinas e coleta de exames.', 'Al. Rio Negro, 3600 (Tamboré)', 'Tamboré, Santana de Parnaíba', '(11) 4191-0006', -23.4985, -46.8302, 15, 0, 120, 12, '{"Pix","Cartão de crédito","Cartão de débito"}', '#ef4444', '🩺');
insert into public.profissionais (id, prestador_id, nome, ordem) values ('364ed7be-cfdb-474b-aea3-663b9c25550e', 'b10dc682-582a-46fb-abf0-892f0d8112ab', 'Dra. Helena', 0), ('41744e1a-eb62-4aa3-a20c-b42cfc1d853a', 'b10dc682-582a-46fb-abf0-892f0d8112ab', 'Dr. Caio', 1), ('8e15a3e7-b3ca-4267-a380-b1b806890294', 'b10dc682-582a-46fb-abf0-892f0d8112ab', 'Dra. Sofia', 2);
insert into public.horarios (prestador_id, dia_semana, abre_min, fecha_min) values ('b10dc682-582a-46fb-abf0-892f0d8112ab', 0, 480, 1200), ('b10dc682-582a-46fb-abf0-892f0d8112ab', 1, 420, 1260), ('b10dc682-582a-46fb-abf0-892f0d8112ab', 2, 420, 1260), ('b10dc682-582a-46fb-abf0-892f0d8112ab', 3, 420, 1260), ('b10dc682-582a-46fb-abf0-892f0d8112ab', 4, 420, 1260), ('b10dc682-582a-46fb-abf0-892f0d8112ab', 5, 420, 1260), ('b10dc682-582a-46fb-abf0-892f0d8112ab', 6, 480, 1200);
insert into public.servicos (id, prestador_id, nome, tipo, especies, preco_a_partir, ativo) values ('b259d0bd-ecc0-44ed-ad17-c2b130204ddd', 'b10dc682-582a-46fb-abf0-892f0d8112ab', 'Consulta clínica', 'veterinario', '{"cao","gato","outro"}', false, true);
insert into public.servico_portes (servico_id, porte, duracao_min, preco) values ('b259d0bd-ecc0-44ed-ad17-c2b130204ddd', 'mini', 30, 260), ('b259d0bd-ecc0-44ed-ad17-c2b130204ddd', 'pequeno', 30, 260), ('b259d0bd-ecc0-44ed-ad17-c2b130204ddd', 'medio', 30, 260), ('b259d0bd-ecc0-44ed-ad17-c2b130204ddd', 'grande', 30, 260), ('b259d0bd-ecc0-44ed-ad17-c2b130204ddd', 'gigante', 30, 260);
insert into public.servicos (id, prestador_id, nome, tipo, especies, preco_a_partir, ativo) values ('819c4604-db12-4807-a24f-f4eb349fb88f', 'b10dc682-582a-46fb-abf0-892f0d8112ab', 'Vacinação', 'veterinario', '{"cao","gato"}', true, true);
insert into public.servico_portes (servico_id, porte, duracao_min, preco) values ('819c4604-db12-4807-a24f-f4eb349fb88f', 'mini', 15, 120), ('819c4604-db12-4807-a24f-f4eb349fb88f', 'pequeno', 15, 120), ('819c4604-db12-4807-a24f-f4eb349fb88f', 'medio', 15, 120), ('819c4604-db12-4807-a24f-f4eb349fb88f', 'grande', 15, 120), ('819c4604-db12-4807-a24f-f4eb349fb88f', 'gigante', 15, 120);
insert into public.servicos (id, prestador_id, nome, tipo, especies, preco_a_partir, ativo) values ('83f58e6b-6469-4df9-a037-c6d90e71217c', 'b10dc682-582a-46fb-abf0-892f0d8112ab', 'Retorno de consulta', 'veterinario', '{"cao","gato"}', false, true);
insert into public.servico_portes (servico_id, porte, duracao_min, preco) values ('83f58e6b-6469-4df9-a037-c6d90e71217c', 'mini', 15, 0), ('83f58e6b-6469-4df9-a037-c6d90e71217c', 'pequeno', 15, 0), ('83f58e6b-6469-4df9-a037-c6d90e71217c', 'medio', 15, 0), ('83f58e6b-6469-4df9-a037-c6d90e71217c', 'grande', 15, 0), ('83f58e6b-6469-4df9-a037-c6d90e71217c', 'gigante', 15, 0);
insert into public.servicos (id, prestador_id, nome, tipo, especies, preco_a_partir, ativo) values ('d5aa60c3-c416-44d1-a154-2cd78a875c41', 'b10dc682-582a-46fb-abf0-892f0d8112ab', 'Exames de sangue (coleta)', 'veterinario', '{"cao","gato"}', true, true);
insert into public.servico_portes (servico_id, porte, duracao_min, preco) values ('d5aa60c3-c416-44d1-a154-2cd78a875c41', 'mini', 15, null), ('d5aa60c3-c416-44d1-a154-2cd78a875c41', 'pequeno', 15, null), ('d5aa60c3-c416-44d1-a154-2cd78a875c41', 'medio', 15, null), ('d5aa60c3-c416-44d1-a154-2cd78a875c41', 'grande', 15, null), ('d5aa60c3-c416-44d1-a154-2cd78a875c41', 'gigante', 15, null);

-- Banho Express
insert into public.prestadores (id, slug, nome, tipos, descricao, endereco, bairro, telefone, lat, lng, passo_min, limpeza_min, antecedencia_min, janela_cancelamento_h, pagamentos, cor, emoji) values ('7eb0468a-5498-458b-a670-517840a08fc4', 'banho-express-industrial', 'Banho Express', '{"banho_tosa"}', 'Banho rápido para quem tem pressa. Atende até 20h.', 'Av. Tamboré, 1400', 'Alphaville Industrial, Barueri', '(11) 4191-0007', -23.5057, -46.8566, 30, 15, 120, 2, '{"Pix","Cartão de crédito","Cartão de débito"}', '#0ea5e9', '🛁');
insert into public.profissionais (id, prestador_id, nome, ordem) values ('06c029bb-0dc2-429b-ae58-882b657e9403', '7eb0468a-5498-458b-a670-517840a08fc4', 'Edu', 0), ('e1ed0fde-d0f6-4603-a2fc-20e6913c0408', '7eb0468a-5498-458b-a670-517840a08fc4', 'Nina', 1);
insert into public.horarios (prestador_id, dia_semana, abre_min, fecha_min) values ('7eb0468a-5498-458b-a670-517840a08fc4', 1, 600, 1200), ('7eb0468a-5498-458b-a670-517840a08fc4', 2, 600, 1200), ('7eb0468a-5498-458b-a670-517840a08fc4', 3, 600, 1200), ('7eb0468a-5498-458b-a670-517840a08fc4', 4, 600, 1200), ('7eb0468a-5498-458b-a670-517840a08fc4', 5, 600, 1200), ('7eb0468a-5498-458b-a670-517840a08fc4', 6, 540, 900);
insert into public.servicos (id, prestador_id, nome, tipo, especies, preco_a_partir, ativo) values ('8a52af49-2721-41f7-af18-b02312ea5984', '7eb0468a-5498-458b-a670-517840a08fc4', 'Banho', 'banho_tosa', '{"cao","gato"}', false, true);
insert into public.servico_portes (servico_id, porte, duracao_min, preco) values ('8a52af49-2721-41f7-af18-b02312ea5984', 'mini', 45, 55), ('8a52af49-2721-41f7-af18-b02312ea5984', 'pequeno', 60, 65), ('8a52af49-2721-41f7-af18-b02312ea5984', 'medio', 75, 80), ('8a52af49-2721-41f7-af18-b02312ea5984', 'grande', 90, 100), ('8a52af49-2721-41f7-af18-b02312ea5984', 'gigante', 120, 125);
insert into public.servicos (id, prestador_id, nome, tipo, especies, preco_a_partir, ativo) values ('b1dfe379-6258-4856-a618-be0952901298', '7eb0468a-5498-458b-a670-517840a08fc4', 'Tosa higiênica', 'banho_tosa', '{"cao","gato"}', false, true);
insert into public.servico_portes (servico_id, porte, duracao_min, preco) values ('b1dfe379-6258-4856-a618-be0952901298', 'mini', 30, 35), ('b1dfe379-6258-4856-a618-be0952901298', 'pequeno', 30, 35), ('b1dfe379-6258-4856-a618-be0952901298', 'medio', 30, 35), ('b1dfe379-6258-4856-a618-be0952901298', 'grande', 30, 35), ('b1dfe379-6258-4856-a618-be0952901298', 'gigante', 30, 35);

-- Gatil Zen
insert into public.prestadores (id, slug, nome, tipos, descricao, endereco, bairro, telefone, lat, lng, passo_min, limpeza_min, antecedencia_min, janela_cancelamento_h, pagamentos, cor, emoji) values ('4b10f564-8a53-4878-a509-bdbffd339efc', 'gatil-zen', 'Gatil Zen', '{"banho_tosa","veterinario"}', 'Só gatos: ambiente sem cães, banho e consulta felina.', 'Alameda Grajaú, 98', 'Alphaville, Barueri', '(11) 4191-0008', -23.4952, -46.8433, 30, 15, 120, 2, '{"Pix","Cartão de crédito","Cartão de débito"}', '#ec4899', '🐈');
insert into public.profissionais (id, prestador_id, nome, ordem) values ('714f2a74-68c7-4e5e-ac93-7c84ed206514', '4b10f564-8a53-4878-a509-bdbffd339efc', 'Dra. Lia', 0);
insert into public.horarios (prestador_id, dia_semana, abre_min, fecha_min) values ('4b10f564-8a53-4878-a509-bdbffd339efc', 1, 480, 1080), ('4b10f564-8a53-4878-a509-bdbffd339efc', 2, 480, 1080), ('4b10f564-8a53-4878-a509-bdbffd339efc', 3, 480, 1080), ('4b10f564-8a53-4878-a509-bdbffd339efc', 4, 480, 1080), ('4b10f564-8a53-4878-a509-bdbffd339efc', 5, 480, 1080);
insert into public.servicos (id, prestador_id, nome, tipo, especies, preco_a_partir, ativo) values ('b6f6d3f3-8e0b-49bc-ac76-2c64bdcf7ab8', '4b10f564-8a53-4878-a509-bdbffd339efc', 'Banho felino', 'banho_tosa', '{"gato"}', false, true);
insert into public.servico_portes (servico_id, porte, duracao_min, preco) values ('b6f6d3f3-8e0b-49bc-ac76-2c64bdcf7ab8', 'mini', 60, 90), ('b6f6d3f3-8e0b-49bc-ac76-2c64bdcf7ab8', 'pequeno', 60, 90), ('b6f6d3f3-8e0b-49bc-ac76-2c64bdcf7ab8', 'medio', 60, 90), ('b6f6d3f3-8e0b-49bc-ac76-2c64bdcf7ab8', 'grande', 60, 90), ('b6f6d3f3-8e0b-49bc-ac76-2c64bdcf7ab8', 'gigante', 60, 90);
insert into public.servicos (id, prestador_id, nome, tipo, especies, preco_a_partir, ativo) values ('87b82434-6c0c-43dc-a9c0-2b90186ec52e', '4b10f564-8a53-4878-a509-bdbffd339efc', 'Consulta felina', 'veterinario', '{"gato"}', false, true);
insert into public.servico_portes (servico_id, porte, duracao_min, preco) values ('87b82434-6c0c-43dc-a9c0-2b90186ec52e', 'mini', 40, 240), ('87b82434-6c0c-43dc-a9c0-2b90186ec52e', 'pequeno', 40, 240), ('87b82434-6c0c-43dc-a9c0-2b90186ec52e', 'medio', 40, 240), ('87b82434-6c0c-43dc-a9c0-2b90186ec52e', 'grande', 40, 240), ('87b82434-6c0c-43dc-a9c0-2b90186ec52e', 'gigante', 40, 240);

-- Mundo Pet Aldeia
insert into public.prestadores (id, slug, nome, tipos, descricao, endereco, bairro, telefone, lat, lng, passo_min, limpeza_min, antecedencia_min, janela_cancelamento_h, pagamentos, cor, emoji) values ('711744fc-8722-409f-aadf-6701e9ef43e2', 'mundo-pet-aldeia', 'Mundo Pet Aldeia', '{"petshop","banho_tosa"}', 'Pet shop de bairro na Aldeia da Serra.', 'Estr. da Aldeia, 2100', 'Aldeia da Serra, Barueri', '(11) 4191-0009', -23.4672, -46.8771, 30, 15, 120, 2, '{"Pix","Cartão de crédito","Cartão de débito"}', '#f59e0b', '🦴');
insert into public.profissionais (id, prestador_id, nome, ordem) values ('fb1880e7-efd8-4c15-a9cd-e31cfa8f594d', '711744fc-8722-409f-aadf-6701e9ef43e2', 'Gil', 0);
insert into public.horarios (prestador_id, dia_semana, abre_min, fecha_min) values ('711744fc-8722-409f-aadf-6701e9ef43e2', 1, 480, 1080), ('711744fc-8722-409f-aadf-6701e9ef43e2', 2, 480, 1080), ('711744fc-8722-409f-aadf-6701e9ef43e2', 3, 480, 1080), ('711744fc-8722-409f-aadf-6701e9ef43e2', 4, 480, 1080), ('711744fc-8722-409f-aadf-6701e9ef43e2', 5, 480, 1080), ('711744fc-8722-409f-aadf-6701e9ef43e2', 6, 480, 840);
insert into public.servicos (id, prestador_id, nome, tipo, especies, preco_a_partir, ativo) values ('f70ee445-d23d-45a1-a78b-1db148e52929', '711744fc-8722-409f-aadf-6701e9ef43e2', 'Banho', 'banho_tosa', '{"cao","gato"}', false, true);
insert into public.servico_portes (servico_id, porte, duracao_min, preco) values ('f70ee445-d23d-45a1-a78b-1db148e52929', 'mini', 45, 55), ('f70ee445-d23d-45a1-a78b-1db148e52929', 'pequeno', 60, 65), ('f70ee445-d23d-45a1-a78b-1db148e52929', 'medio', 75, 80), ('f70ee445-d23d-45a1-a78b-1db148e52929', 'grande', 90, 100), ('f70ee445-d23d-45a1-a78b-1db148e52929', 'gigante', 120, 125);
insert into public.servicos (id, prestador_id, nome, tipo, especies, preco_a_partir, ativo) values ('5ec394d9-b9ce-4fea-a218-d763cbe09c20', '711744fc-8722-409f-aadf-6701e9ef43e2', 'Banho e tosa', 'banho_tosa', '{"cao","gato"}', false, true);
insert into public.servico_portes (servico_id, porte, duracao_min, preco) values ('5ec394d9-b9ce-4fea-a218-d763cbe09c20', 'mini', 75, 85), ('5ec394d9-b9ce-4fea-a218-d763cbe09c20', 'pequeno', 90, 100), ('5ec394d9-b9ce-4fea-a218-d763cbe09c20', 'medio', 105, 120), ('5ec394d9-b9ce-4fea-a218-d763cbe09c20', 'grande', 120, 145), ('5ec394d9-b9ce-4fea-a218-d763cbe09c20', 'gigante', 150, 175);
insert into public.servicos (id, prestador_id, nome, tipo, especies, preco_a_partir, ativo) values ('cc24465a-011b-43c5-afb5-e9666f40ecbe', '711744fc-8722-409f-aadf-6701e9ef43e2', 'Corte de unhas', 'petshop', '{"cao","gato"}', false, true);
insert into public.servico_portes (servico_id, porte, duracao_min, preco) values ('cc24465a-011b-43c5-afb5-e9666f40ecbe', 'mini', 15, 15), ('cc24465a-011b-43c5-afb5-e9666f40ecbe', 'pequeno', 15, 15), ('cc24465a-011b-43c5-afb5-e9666f40ecbe', 'medio', 15, 15), ('cc24465a-011b-43c5-afb5-e9666f40ecbe', 'grande', 15, 15), ('cc24465a-011b-43c5-afb5-e9666f40ecbe', 'gigante', 15, 15);

-- Faro Fino
insert into public.prestadores (id, slug, nome, tipos, descricao, endereco, bairro, telefone, lat, lng, passo_min, limpeza_min, antecedencia_min, janela_cancelamento_h, pagamentos, cor, emoji) values ('d898f5e8-e966-4a2a-a78a-473adf0e8e44', 'faro-fino-adestramento', 'Faro Fino', '{"adestramento"}', 'Aulas individuais e socialização de filhotes.', 'Calçada dos Cravos, 40', 'Alphaville, Barueri', '(11) 4191-0010', -23.5038, -46.84, 30, 30, 120, 24, '{"Pix","Cartão de crédito","Cartão de débito"}', '#8b5cf6', '🎾');
insert into public.profissionais (id, prestador_id, nome, ordem) values ('f6125c87-fc53-4436-af75-cce5c4b4c036', 'd898f5e8-e966-4a2a-a78a-473adf0e8e44', 'Ana', 0);
insert into public.horarios (prestador_id, dia_semana, abre_min, fecha_min) values ('d898f5e8-e966-4a2a-a78a-473adf0e8e44', 2, 900, 1200), ('d898f5e8-e966-4a2a-a78a-473adf0e8e44', 3, 900, 1200), ('d898f5e8-e966-4a2a-a78a-473adf0e8e44', 4, 900, 1200), ('d898f5e8-e966-4a2a-a78a-473adf0e8e44', 5, 900, 1200), ('d898f5e8-e966-4a2a-a78a-473adf0e8e44', 6, 540, 780);
insert into public.servicos (id, prestador_id, nome, tipo, especies, preco_a_partir, ativo) values ('9c9c6ce2-f216-4baf-a269-30821fcdcf8a', 'd898f5e8-e966-4a2a-a78a-473adf0e8e44', 'Aula de adestramento', 'adestramento', '{"cao"}', false, true);
insert into public.servico_portes (servico_id, porte, duracao_min, preco) values ('9c9c6ce2-f216-4baf-a269-30821fcdcf8a', 'mini', 60, 160), ('9c9c6ce2-f216-4baf-a269-30821fcdcf8a', 'pequeno', 60, 160), ('9c9c6ce2-f216-4baf-a269-30821fcdcf8a', 'medio', 60, 160), ('9c9c6ce2-f216-4baf-a269-30821fcdcf8a', 'grande', 60, 160), ('9c9c6ce2-f216-4baf-a269-30821fcdcf8a', 'gigante', 60, 160);
insert into public.servicos (id, prestador_id, nome, tipo, especies, preco_a_partir, ativo) values ('12068ef1-c377-4894-a9c3-390a85b9092f', 'd898f5e8-e966-4a2a-a78a-473adf0e8e44', 'Avaliação comportamental', 'adestramento', '{"cao"}', false, true);
insert into public.servico_portes (servico_id, porte, duracao_min, preco) values ('12068ef1-c377-4894-a9c3-390a85b9092f', 'mini', 45, 120), ('12068ef1-c377-4894-a9c3-390a85b9092f', 'pequeno', 45, 120), ('12068ef1-c377-4894-a9c3-390a85b9092f', 'medio', 45, 120), ('12068ef1-c377-4894-a9c3-390a85b9092f', 'grande', 45, 120), ('12068ef1-c377-4894-a9c3-390a85b9092f', 'gigante', 45, 120);

-- Pet Center Barueri
insert into public.prestadores (id, slug, nome, tipos, descricao, endereco, bairro, telefone, lat, lng, passo_min, limpeza_min, antecedencia_min, janela_cancelamento_h, pagamentos, cor, emoji) values ('1b12f9d0-a87a-46e5-ac1d-016c7480bb15', 'pet-center-barueri', 'Pet Center Barueri', '{"petshop","veterinario"}', 'Pet shop com consultório veterinário.', 'R. Campos Sales, 300', 'Centro, Barueri', '(11) 4191-0011', -23.5115, -46.8752, 15, 0, 120, 2, '{"Pix","Cartão de crédito","Cartão de débito"}', '#f59e0b', '🦴');
insert into public.profissionais (id, prestador_id, nome, ordem) values ('19e48fa3-30a3-47a5-a9a8-e12d74935b59', '1b12f9d0-a87a-46e5-ac1d-016c7480bb15', 'Dr. Felipe', 0);
insert into public.horarios (prestador_id, dia_semana, abre_min, fecha_min) values ('1b12f9d0-a87a-46e5-ac1d-016c7480bb15', 1, 480, 1080), ('1b12f9d0-a87a-46e5-ac1d-016c7480bb15', 2, 480, 1080), ('1b12f9d0-a87a-46e5-ac1d-016c7480bb15', 3, 480, 1080), ('1b12f9d0-a87a-46e5-ac1d-016c7480bb15', 4, 480, 1080), ('1b12f9d0-a87a-46e5-ac1d-016c7480bb15', 5, 480, 1080), ('1b12f9d0-a87a-46e5-ac1d-016c7480bb15', 6, 480, 840);
insert into public.servicos (id, prestador_id, nome, tipo, especies, preco_a_partir, ativo) values ('e71e65eb-37f6-4030-a88b-a419713b58fe', '1b12f9d0-a87a-46e5-ac1d-016c7480bb15', 'Consulta clínica', 'veterinario', '{"cao","gato","outro"}', false, true);
insert into public.servico_portes (servico_id, porte, duracao_min, preco) values ('e71e65eb-37f6-4030-a88b-a419713b58fe', 'mini', 30, 180), ('e71e65eb-37f6-4030-a88b-a419713b58fe', 'pequeno', 30, 180), ('e71e65eb-37f6-4030-a88b-a419713b58fe', 'medio', 30, 180), ('e71e65eb-37f6-4030-a88b-a419713b58fe', 'grande', 30, 180), ('e71e65eb-37f6-4030-a88b-a419713b58fe', 'gigante', 30, 180);
insert into public.servicos (id, prestador_id, nome, tipo, especies, preco_a_partir, ativo) values ('862ed086-6fe9-4424-a272-af73a8ded9e4', '1b12f9d0-a87a-46e5-ac1d-016c7480bb15', 'Vacinação', 'veterinario', '{"cao","gato"}', true, true);
insert into public.servico_portes (servico_id, porte, duracao_min, preco) values ('862ed086-6fe9-4424-a272-af73a8ded9e4', 'mini', 15, 95), ('862ed086-6fe9-4424-a272-af73a8ded9e4', 'pequeno', 15, 95), ('862ed086-6fe9-4424-a272-af73a8ded9e4', 'medio', 15, 95), ('862ed086-6fe9-4424-a272-af73a8ded9e4', 'grande', 15, 95), ('862ed086-6fe9-4424-a272-af73a8ded9e4', 'gigante', 15, 95);
insert into public.servicos (id, prestador_id, nome, tipo, especies, preco_a_partir, ativo) values ('f02dacf7-9360-4d88-a1ec-c859cddf6837', '1b12f9d0-a87a-46e5-ac1d-016c7480bb15', 'Corte de unhas', 'petshop', '{"cao","gato"}', false, true);
insert into public.servico_portes (servico_id, porte, duracao_min, preco) values ('f02dacf7-9360-4d88-a1ec-c859cddf6837', 'mini', 15, 15), ('f02dacf7-9360-4d88-a1ec-c859cddf6837', 'pequeno', 15, 15), ('f02dacf7-9360-4d88-a1ec-c859cddf6837', 'medio', 15, 15), ('f02dacf7-9360-4d88-a1ec-c859cddf6837', 'grande', 15, 15), ('f02dacf7-9360-4d88-a1ec-c859cddf6837', 'gigante', 15, 15);

-- Spa Canino Alpha
insert into public.prestadores (id, slug, nome, tipos, descricao, endereco, bairro, telefone, lat, lng, passo_min, limpeza_min, antecedencia_min, janela_cancelamento_h, pagamentos, cor, emoji) values ('99a952ff-12ca-4d81-a5f1-0bdb6c160657', 'spa-canino-alpha', 'Spa Canino Alpha', '{"banho_tosa"}', 'Banho com ozônio, hidratação e tosa da raça.', 'Av. Andrômeda, 885', 'Alphaville, Barueri', '(11) 4191-0012', -23.4961, -46.8575, 30, 15, 120, 2, '{"Pix","Cartão de crédito","Cartão de débito"}', '#0ea5e9', '🛁');
insert into public.profissionais (id, prestador_id, nome, ordem) values ('9e94b492-ffa2-49c0-a299-0dfb16a1086f', '99a952ff-12ca-4d81-a5f1-0bdb6c160657', 'Vivi', 0), ('bc9300f9-10ae-4afe-a54b-5a70c667297f', '99a952ff-12ca-4d81-a5f1-0bdb6c160657', 'Duda', 1);
insert into public.horarios (prestador_id, dia_semana, abre_min, fecha_min) values ('99a952ff-12ca-4d81-a5f1-0bdb6c160657', 1, 480, 1080), ('99a952ff-12ca-4d81-a5f1-0bdb6c160657', 2, 480, 1080), ('99a952ff-12ca-4d81-a5f1-0bdb6c160657', 3, 480, 1080), ('99a952ff-12ca-4d81-a5f1-0bdb6c160657', 4, 480, 1080), ('99a952ff-12ca-4d81-a5f1-0bdb6c160657', 5, 480, 1080), ('99a952ff-12ca-4d81-a5f1-0bdb6c160657', 6, 480, 960);
insert into public.servicos (id, prestador_id, nome, tipo, especies, preco_a_partir, ativo) values ('99e2dec6-d988-4d98-aa82-0024049b5498', '99a952ff-12ca-4d81-a5f1-0bdb6c160657', 'Banho', 'banho_tosa', '{"cao","gato"}', false, true);
insert into public.servico_portes (servico_id, porte, duracao_min, preco) values ('99e2dec6-d988-4d98-aa82-0024049b5498', 'mini', 45, 85), ('99e2dec6-d988-4d98-aa82-0024049b5498', 'pequeno', 60, 95), ('99e2dec6-d988-4d98-aa82-0024049b5498', 'medio', 75, 110), ('99e2dec6-d988-4d98-aa82-0024049b5498', 'grande', 90, 130), ('99e2dec6-d988-4d98-aa82-0024049b5498', 'gigante', 120, 155);
insert into public.servicos (id, prestador_id, nome, tipo, especies, preco_a_partir, ativo) values ('bebd649c-aa73-4f62-a2fe-3049dbc58686', '99a952ff-12ca-4d81-a5f1-0bdb6c160657', 'Banho e tosa', 'banho_tosa', '{"cao","gato"}', false, true);
insert into public.servico_portes (servico_id, porte, duracao_min, preco) values ('bebd649c-aa73-4f62-a2fe-3049dbc58686', 'mini', 75, 130), ('bebd649c-aa73-4f62-a2fe-3049dbc58686', 'pequeno', 90, 145), ('bebd649c-aa73-4f62-a2fe-3049dbc58686', 'medio', 105, 165), ('bebd649c-aa73-4f62-a2fe-3049dbc58686', 'grande', 120, 190), ('bebd649c-aa73-4f62-a2fe-3049dbc58686', 'gigante', 150, 220);
insert into public.servicos (id, prestador_id, nome, tipo, especies, preco_a_partir, ativo) values ('564846b7-bec6-4156-a9e2-de19949111da', '99a952ff-12ca-4d81-a5f1-0bdb6c160657', 'Tosa higiênica', 'banho_tosa', '{"cao","gato"}', false, true);
insert into public.servico_portes (servico_id, porte, duracao_min, preco) values ('564846b7-bec6-4156-a9e2-de19949111da', 'mini', 30, 50), ('564846b7-bec6-4156-a9e2-de19949111da', 'pequeno', 30, 50), ('564846b7-bec6-4156-a9e2-de19949111da', 'medio', 30, 50), ('564846b7-bec6-4156-a9e2-de19949111da', 'grande', 30, 50), ('564846b7-bec6-4156-a9e2-de19949111da', 'gigante', 30, 50);
insert into public.servicos (id, prestador_id, nome, tipo, especies, preco_a_partir, ativo) values ('5816bbbe-8952-4d28-a651-2196d5c929a6', '99a952ff-12ca-4d81-a5f1-0bdb6c160657', 'Hidratação de pelos', 'petshop', '{"cao","gato"}', false, true);
insert into public.servico_portes (servico_id, porte, duracao_min, preco) values ('5816bbbe-8952-4d28-a651-2196d5c929a6', 'mini', 30, 45), ('5816bbbe-8952-4d28-a651-2196d5c929a6', 'pequeno', 30, 45), ('5816bbbe-8952-4d28-a651-2196d5c929a6', 'medio', 30, 55), ('5816bbbe-8952-4d28-a651-2196d5c929a6', 'grande', 30, 65), ('5816bbbe-8952-4d28-a651-2196d5c929a6', 'gigante', 30, 75);

-- Banho & Charme
insert into public.prestadores (id, slug, nome, tipos, descricao, endereco, bairro, telefone, lat, lng, passo_min, limpeza_min, antecedencia_min, janela_cancelamento_h, pagamentos, cor, emoji) values ('bff47848-a10e-4647-a60e-6ba3b55f1c94', 'banho-e-charme-santo-andre', 'Banho & Charme', '{"banho_tosa","petshop"}', 'Banho e tosa com hora marcada e hidratação para pelos longos.', 'Rua das Figueiras, 1210', 'Jardim, Santo André', '(11) 4191-0013', -23.6553, -46.5296, 30, 15, 120, 2, '{"Pix","Cartão de crédito","Cartão de débito"}', '#0ea5e9', '🛁');
insert into public.profissionais (id, prestador_id, nome, ordem) values ('2789b16c-3e2d-44e1-a37c-2b69a0372c81', 'bff47848-a10e-4647-a60e-6ba3b55f1c94', 'Patrícia', 0), ('94108970-2965-4850-aa50-b29a04af82cc', 'bff47848-a10e-4647-a60e-6ba3b55f1c94', 'Léo', 1);
insert into public.horarios (prestador_id, dia_semana, abre_min, fecha_min) values ('bff47848-a10e-4647-a60e-6ba3b55f1c94', 1, 480, 1080), ('bff47848-a10e-4647-a60e-6ba3b55f1c94', 2, 480, 1080), ('bff47848-a10e-4647-a60e-6ba3b55f1c94', 3, 480, 1080), ('bff47848-a10e-4647-a60e-6ba3b55f1c94', 4, 480, 1080), ('bff47848-a10e-4647-a60e-6ba3b55f1c94', 5, 480, 1080), ('bff47848-a10e-4647-a60e-6ba3b55f1c94', 6, 480, 840);
insert into public.servicos (id, prestador_id, nome, tipo, especies, preco_a_partir, ativo) values ('eeea3e7f-3ca6-4136-af7a-e02077e9eb0f', 'bff47848-a10e-4647-a60e-6ba3b55f1c94', 'Banho', 'banho_tosa', '{"cao","gato"}', false, true);
insert into public.servico_portes (servico_id, porte, duracao_min, preco) values ('eeea3e7f-3ca6-4136-af7a-e02077e9eb0f', 'mini', 45, 60), ('eeea3e7f-3ca6-4136-af7a-e02077e9eb0f', 'pequeno', 60, 70), ('eeea3e7f-3ca6-4136-af7a-e02077e9eb0f', 'medio', 75, 85), ('eeea3e7f-3ca6-4136-af7a-e02077e9eb0f', 'grande', 90, 105), ('eeea3e7f-3ca6-4136-af7a-e02077e9eb0f', 'gigante', 120, 130);
insert into public.servicos (id, prestador_id, nome, tipo, especies, preco_a_partir, ativo) values ('8b01d167-910e-4482-a0de-997f4ef6dc15', 'bff47848-a10e-4647-a60e-6ba3b55f1c94', 'Banho e tosa', 'banho_tosa', '{"cao","gato"}', false, true);
insert into public.servico_portes (servico_id, porte, duracao_min, preco) values ('8b01d167-910e-4482-a0de-997f4ef6dc15', 'mini', 75, 95), ('8b01d167-910e-4482-a0de-997f4ef6dc15', 'pequeno', 90, 110), ('8b01d167-910e-4482-a0de-997f4ef6dc15', 'medio', 105, 130), ('8b01d167-910e-4482-a0de-997f4ef6dc15', 'grande', 120, 155), ('8b01d167-910e-4482-a0de-997f4ef6dc15', 'gigante', 150, 185);
insert into public.servicos (id, prestador_id, nome, tipo, especies, preco_a_partir, ativo) values ('30e111c9-aa8a-4556-a461-e1e69a302e82', 'bff47848-a10e-4647-a60e-6ba3b55f1c94', 'Tosa higiênica', 'banho_tosa', '{"cao","gato"}', false, true);
insert into public.servico_portes (servico_id, porte, duracao_min, preco) values ('30e111c9-aa8a-4556-a461-e1e69a302e82', 'mini', 30, 40), ('30e111c9-aa8a-4556-a461-e1e69a302e82', 'pequeno', 30, 40), ('30e111c9-aa8a-4556-a461-e1e69a302e82', 'medio', 30, 40), ('30e111c9-aa8a-4556-a461-e1e69a302e82', 'grande', 30, 40), ('30e111c9-aa8a-4556-a461-e1e69a302e82', 'gigante', 30, 40);
insert into public.servicos (id, prestador_id, nome, tipo, especies, preco_a_partir, ativo) values ('a650c059-49c7-4717-acca-bcf2d13ff77a', 'bff47848-a10e-4647-a60e-6ba3b55f1c94', 'Hidratação de pelos', 'petshop', '{"cao","gato"}', false, true);
insert into public.servico_portes (servico_id, porte, duracao_min, preco) values ('a650c059-49c7-4717-acca-bcf2d13ff77a', 'mini', 30, 35), ('a650c059-49c7-4717-acca-bcf2d13ff77a', 'pequeno', 30, 35), ('a650c059-49c7-4717-acca-bcf2d13ff77a', 'medio', 30, 45), ('a650c059-49c7-4717-acca-bcf2d13ff77a', 'grande', 30, 55), ('a650c059-49c7-4717-acca-bcf2d13ff77a', 'gigante', 30, 65);
insert into public.servicos (id, prestador_id, nome, tipo, especies, preco_a_partir, ativo) values ('3bfcd35f-e814-4326-ae40-7808ffab4954', 'bff47848-a10e-4647-a60e-6ba3b55f1c94', 'Corte de unhas', 'petshop', '{"cao","gato"}', false, true);
insert into public.servico_portes (servico_id, porte, duracao_min, preco) values ('3bfcd35f-e814-4326-ae40-7808ffab4954', 'mini', 15, 18), ('3bfcd35f-e814-4326-ae40-7808ffab4954', 'pequeno', 15, 18), ('3bfcd35f-e814-4326-ae40-7808ffab4954', 'medio', 15, 18), ('3bfcd35f-e814-4326-ae40-7808ffab4954', 'grande', 15, 18), ('3bfcd35f-e814-4326-ae40-7808ffab4954', 'gigante', 15, 18);

-- VetVida Santo André
insert into public.prestadores (id, slug, nome, tipos, descricao, endereco, bairro, telefone, lat, lng, passo_min, limpeza_min, antecedencia_min, janela_cancelamento_h, pagamentos, cor, emoji) values ('3f2e0ded-cc3c-4211-a1f6-683a153783de', 'vetvida-santo-andre', 'VetVida Santo André', '{"veterinario"}', 'Clínica geral e vacinas para cães e gatos.', 'Av. Portugal, 820', 'Centro, Santo André', '(11) 4191-0014', -23.6612, -46.5368, 15, 0, 120, 12, '{"Pix","Cartão de crédito","Cartão de débito"}', '#ef4444', '🩺');
insert into public.profissionais (id, prestador_id, nome, ordem) values ('79b3c47b-18e9-4a69-ab03-dda6a3399a7d', '3f2e0ded-cc3c-4211-a1f6-683a153783de', 'Dra. Renata', 0), ('a2b69778-514d-4b61-ad28-98d8df93f206', '3f2e0ded-cc3c-4211-a1f6-683a153783de', 'Dr. Murilo', 1);
insert into public.horarios (prestador_id, dia_semana, abre_min, fecha_min) values ('3f2e0ded-cc3c-4211-a1f6-683a153783de', 1, 480, 1140), ('3f2e0ded-cc3c-4211-a1f6-683a153783de', 2, 480, 1140), ('3f2e0ded-cc3c-4211-a1f6-683a153783de', 3, 480, 1140), ('3f2e0ded-cc3c-4211-a1f6-683a153783de', 4, 480, 1140), ('3f2e0ded-cc3c-4211-a1f6-683a153783de', 5, 480, 1140), ('3f2e0ded-cc3c-4211-a1f6-683a153783de', 6, 480, 840);
insert into public.servicos (id, prestador_id, nome, tipo, especies, preco_a_partir, ativo) values ('a5181e61-f902-4b41-aef4-b184b578bab0', '3f2e0ded-cc3c-4211-a1f6-683a153783de', 'Consulta clínica', 'veterinario', '{"cao","gato","outro"}', false, true);
insert into public.servico_portes (servico_id, porte, duracao_min, preco) values ('a5181e61-f902-4b41-aef4-b184b578bab0', 'mini', 30, 190), ('a5181e61-f902-4b41-aef4-b184b578bab0', 'pequeno', 30, 190), ('a5181e61-f902-4b41-aef4-b184b578bab0', 'medio', 30, 190), ('a5181e61-f902-4b41-aef4-b184b578bab0', 'grande', 30, 190), ('a5181e61-f902-4b41-aef4-b184b578bab0', 'gigante', 30, 190);
insert into public.servicos (id, prestador_id, nome, tipo, especies, preco_a_partir, ativo) values ('aeb1ac38-0e3b-4d29-a518-674895f6eec4', '3f2e0ded-cc3c-4211-a1f6-683a153783de', 'Vacinação', 'veterinario', '{"cao","gato"}', true, true);
insert into public.servico_portes (servico_id, porte, duracao_min, preco) values ('aeb1ac38-0e3b-4d29-a518-674895f6eec4', 'mini', 15, 100), ('aeb1ac38-0e3b-4d29-a518-674895f6eec4', 'pequeno', 15, 100), ('aeb1ac38-0e3b-4d29-a518-674895f6eec4', 'medio', 15, 100), ('aeb1ac38-0e3b-4d29-a518-674895f6eec4', 'grande', 15, 100), ('aeb1ac38-0e3b-4d29-a518-674895f6eec4', 'gigante', 15, 100);
insert into public.servicos (id, prestador_id, nome, tipo, especies, preco_a_partir, ativo) values ('21f08966-346a-46fa-af45-391c23950246', '3f2e0ded-cc3c-4211-a1f6-683a153783de', 'Retorno de consulta', 'veterinario', '{"cao","gato"}', false, true);
insert into public.servico_portes (servico_id, porte, duracao_min, preco) values ('21f08966-346a-46fa-af45-391c23950246', 'mini', 15, 0), ('21f08966-346a-46fa-af45-391c23950246', 'pequeno', 15, 0), ('21f08966-346a-46fa-af45-391c23950246', 'medio', 15, 0), ('21f08966-346a-46fa-af45-391c23950246', 'grande', 15, 0), ('21f08966-346a-46fa-af45-391c23950246', 'gigante', 15, 0);
insert into public.servicos (id, prestador_id, nome, tipo, especies, preco_a_partir, ativo) values ('a5cc7720-2f66-4f84-ace7-138b7deadcc8', '3f2e0ded-cc3c-4211-a1f6-683a153783de', 'Exames de sangue (coleta)', 'veterinario', '{"cao","gato"}', true, true);
insert into public.servico_portes (servico_id, porte, duracao_min, preco) values ('a5cc7720-2f66-4f84-ace7-138b7deadcc8', 'mini', 15, null), ('a5cc7720-2f66-4f84-ace7-138b7deadcc8', 'pequeno', 15, null), ('a5cc7720-2f66-4f84-ace7-138b7deadcc8', 'medio', 15, null), ('a5cc7720-2f66-4f84-ace7-138b7deadcc8', 'grande', 15, null), ('a5cc7720-2f66-4f84-ace7-138b7deadcc8', 'gigante', 15, null);

-- Rudge Pet
insert into public.prestadores (id, slug, nome, tipos, descricao, endereco, bairro, telefone, lat, lng, passo_min, limpeza_min, antecedencia_min, janela_cancelamento_h, pagamentos, cor, emoji) values ('effbc03e-da25-4444-a656-613aa34a56c2', 'rudge-pet-sao-bernardo', 'Rudge Pet', '{"petshop","banho_tosa"}', 'Pet shop de bairro com banho, tosa e corte de unhas.', 'Rua Afonsina, 310', 'Rudge Ramos, São Bernardo do Campo', '(11) 4191-0015', -23.6596, -46.5712, 30, 15, 120, 2, '{"Pix","Cartão de crédito","Cartão de débito"}', '#f59e0b', '🦴');
insert into public.profissionais (id, prestador_id, nome, ordem) values ('800c52f1-e331-4e16-abe2-d09ca122dbaf', 'effbc03e-da25-4444-a656-613aa34a56c2', 'Sandra', 0), ('8679671b-766f-4e48-a177-2ea5f64f0348', 'effbc03e-da25-4444-a656-613aa34a56c2', 'Igor', 1);
insert into public.horarios (prestador_id, dia_semana, abre_min, fecha_min) values ('effbc03e-da25-4444-a656-613aa34a56c2', 1, 480, 1080), ('effbc03e-da25-4444-a656-613aa34a56c2', 2, 480, 1080), ('effbc03e-da25-4444-a656-613aa34a56c2', 3, 480, 1080), ('effbc03e-da25-4444-a656-613aa34a56c2', 4, 480, 1080), ('effbc03e-da25-4444-a656-613aa34a56c2', 5, 480, 1080), ('effbc03e-da25-4444-a656-613aa34a56c2', 6, 480, 840);
insert into public.servicos (id, prestador_id, nome, tipo, especies, preco_a_partir, ativo) values ('c8c81133-18cc-4060-a806-c1a4803c2de3', 'effbc03e-da25-4444-a656-613aa34a56c2', 'Banho', 'banho_tosa', '{"cao","gato"}', false, true);
insert into public.servico_portes (servico_id, porte, duracao_min, preco) values ('c8c81133-18cc-4060-a806-c1a4803c2de3', 'mini', 45, 55), ('c8c81133-18cc-4060-a806-c1a4803c2de3', 'pequeno', 60, 65), ('c8c81133-18cc-4060-a806-c1a4803c2de3', 'medio', 75, 80), ('c8c81133-18cc-4060-a806-c1a4803c2de3', 'grande', 90, 100), ('c8c81133-18cc-4060-a806-c1a4803c2de3', 'gigante', 120, 125);
insert into public.servicos (id, prestador_id, nome, tipo, especies, preco_a_partir, ativo) values ('9ed6b202-3fc0-419c-ab72-90d5c64678e2', 'effbc03e-da25-4444-a656-613aa34a56c2', 'Banho e tosa', 'banho_tosa', '{"cao","gato"}', false, true);
insert into public.servico_portes (servico_id, porte, duracao_min, preco) values ('9ed6b202-3fc0-419c-ab72-90d5c64678e2', 'mini', 75, 85), ('9ed6b202-3fc0-419c-ab72-90d5c64678e2', 'pequeno', 90, 100), ('9ed6b202-3fc0-419c-ab72-90d5c64678e2', 'medio', 105, 120), ('9ed6b202-3fc0-419c-ab72-90d5c64678e2', 'grande', 120, 145), ('9ed6b202-3fc0-419c-ab72-90d5c64678e2', 'gigante', 150, 175);
insert into public.servicos (id, prestador_id, nome, tipo, especies, preco_a_partir, ativo) values ('5c5e660f-30ce-48a4-a0bd-80a723de6424', 'effbc03e-da25-4444-a656-613aa34a56c2', 'Corte de unhas', 'petshop', '{"cao","gato"}', false, true);
insert into public.servico_portes (servico_id, porte, duracao_min, preco) values ('5c5e660f-30ce-48a4-a0bd-80a723de6424', 'mini', 15, 15), ('5c5e660f-30ce-48a4-a0bd-80a723de6424', 'pequeno', 15, 15), ('5c5e660f-30ce-48a4-a0bd-80a723de6424', 'medio', 15, 15), ('5c5e660f-30ce-48a4-a0bd-80a723de6424', 'grande', 15, 15), ('5c5e660f-30ce-48a4-a0bd-80a723de6424', 'gigante', 15, 15);
insert into public.servicos (id, prestador_id, nome, tipo, especies, preco_a_partir, ativo) values ('8e13d1d5-4e26-4002-a603-431244ba5cbb', 'effbc03e-da25-4444-a656-613aa34a56c2', 'Hidratação de pelos', 'petshop', '{"cao","gato"}', false, true);
insert into public.servico_portes (servico_id, porte, duracao_min, preco) values ('8e13d1d5-4e26-4002-a603-431244ba5cbb', 'mini', 30, 30), ('8e13d1d5-4e26-4002-a603-431244ba5cbb', 'pequeno', 30, 30), ('8e13d1d5-4e26-4002-a603-431244ba5cbb', 'medio', 30, 40), ('8e13d1d5-4e26-4002-a603-431244ba5cbb', 'grande', 30, 50), ('8e13d1d5-4e26-4002-a603-431244ba5cbb', 'gigante', 30, 60);

-- Clínica Vet Anchieta
insert into public.prestadores (id, slug, nome, tipos, descricao, endereco, bairro, telefone, lat, lng, passo_min, limpeza_min, antecedencia_min, janela_cancelamento_h, pagamentos, cor, emoji) values ('6768db63-d4d0-4995-ad8e-e7edb247777e', 'clinica-vet-anchieta-sbc', 'Clínica Vet Anchieta', '{"veterinario"}', 'Consultas, vacinas e coleta de exames. Atende sábado e domingo de manhã.', 'Rua Marechal Deodoro, 1500', 'Centro, São Bernardo do Campo', '(11) 4191-0016', -23.6921, -46.5618, 15, 0, 120, 12, '{"Pix","Cartão de crédito","Cartão de débito"}', '#ef4444', '🩺');
insert into public.profissionais (id, prestador_id, nome, ordem) values ('3d7a7a83-58ae-45fe-af8f-b25c26096eea', '6768db63-d4d0-4995-ad8e-e7edb247777e', 'Dr. Otávio', 0), ('6a0aded9-ea75-4e2a-ae4a-9b2bcd366cff', '6768db63-d4d0-4995-ad8e-e7edb247777e', 'Dra. Carol', 1);
insert into public.horarios (prestador_id, dia_semana, abre_min, fecha_min) values ('6768db63-d4d0-4995-ad8e-e7edb247777e', 0, 540, 780), ('6768db63-d4d0-4995-ad8e-e7edb247777e', 1, 480, 1200), ('6768db63-d4d0-4995-ad8e-e7edb247777e', 2, 480, 1200), ('6768db63-d4d0-4995-ad8e-e7edb247777e', 3, 480, 1200), ('6768db63-d4d0-4995-ad8e-e7edb247777e', 4, 480, 1200), ('6768db63-d4d0-4995-ad8e-e7edb247777e', 5, 480, 1200), ('6768db63-d4d0-4995-ad8e-e7edb247777e', 6, 480, 960);
insert into public.servicos (id, prestador_id, nome, tipo, especies, preco_a_partir, ativo) values ('3a8fc1d6-7eb7-4521-a161-df248ae6980d', '6768db63-d4d0-4995-ad8e-e7edb247777e', 'Consulta clínica', 'veterinario', '{"cao","gato","outro"}', false, true);
insert into public.servico_portes (servico_id, porte, duracao_min, preco) values ('3a8fc1d6-7eb7-4521-a161-df248ae6980d', 'mini', 30, 210), ('3a8fc1d6-7eb7-4521-a161-df248ae6980d', 'pequeno', 30, 210), ('3a8fc1d6-7eb7-4521-a161-df248ae6980d', 'medio', 30, 210), ('3a8fc1d6-7eb7-4521-a161-df248ae6980d', 'grande', 30, 210), ('3a8fc1d6-7eb7-4521-a161-df248ae6980d', 'gigante', 30, 210);
insert into public.servicos (id, prestador_id, nome, tipo, especies, preco_a_partir, ativo) values ('d43d382f-e882-493c-abef-bc532abdb2fe', '6768db63-d4d0-4995-ad8e-e7edb247777e', 'Vacinação', 'veterinario', '{"cao","gato"}', true, true);
insert into public.servico_portes (servico_id, porte, duracao_min, preco) values ('d43d382f-e882-493c-abef-bc532abdb2fe', 'mini', 15, 105), ('d43d382f-e882-493c-abef-bc532abdb2fe', 'pequeno', 15, 105), ('d43d382f-e882-493c-abef-bc532abdb2fe', 'medio', 15, 105), ('d43d382f-e882-493c-abef-bc532abdb2fe', 'grande', 15, 105), ('d43d382f-e882-493c-abef-bc532abdb2fe', 'gigante', 15, 105);
insert into public.servicos (id, prestador_id, nome, tipo, especies, preco_a_partir, ativo) values ('8bb39e2d-ec36-452f-a835-90753e16584f', '6768db63-d4d0-4995-ad8e-e7edb247777e', 'Retorno de consulta', 'veterinario', '{"cao","gato"}', false, true);
insert into public.servico_portes (servico_id, porte, duracao_min, preco) values ('8bb39e2d-ec36-452f-a835-90753e16584f', 'mini', 15, 0), ('8bb39e2d-ec36-452f-a835-90753e16584f', 'pequeno', 15, 0), ('8bb39e2d-ec36-452f-a835-90753e16584f', 'medio', 15, 0), ('8bb39e2d-ec36-452f-a835-90753e16584f', 'grande', 15, 0), ('8bb39e2d-ec36-452f-a835-90753e16584f', 'gigante', 15, 0);
insert into public.servicos (id, prestador_id, nome, tipo, especies, preco_a_partir, ativo) values ('0cde1716-a78e-4c4b-a018-f992bd0923d3', '6768db63-d4d0-4995-ad8e-e7edb247777e', 'Exames de sangue (coleta)', 'veterinario', '{"cao","gato"}', true, true);
insert into public.servico_portes (servico_id, porte, duracao_min, preco) values ('0cde1716-a78e-4c4b-a018-f992bd0923d3', 'mini', 15, null), ('0cde1716-a78e-4c4b-a018-f992bd0923d3', 'pequeno', 15, null), ('0cde1716-a78e-4c4b-a018-f992bd0923d3', 'medio', 15, null), ('0cde1716-a78e-4c4b-a018-f992bd0923d3', 'grande', 15, null), ('0cde1716-a78e-4c4b-a018-f992bd0923d3', 'gigante', 15, null);

-- Adestra ABC
insert into public.prestadores (id, slug, nome, tipos, descricao, endereco, bairro, telefone, lat, lng, passo_min, limpeza_min, antecedencia_min, janela_cancelamento_h, pagamentos, cor, emoji) values ('0f72c0cd-f5c0-4045-a999-7bd4bb710241', 'adestra-abc', 'Adestra ABC', '{"adestramento"}', 'Adestramento positivo e socialização de filhotes.', 'Av. Pery Ronchetti, 400', 'Nova Petrópolis, São Bernardo do Campo', '(11) 4191-0017', -23.6985, -46.5525, 30, 30, 120, 24, '{"Pix","Cartão de crédito","Cartão de débito"}', '#8b5cf6', '🎾');
insert into public.profissionais (id, prestador_id, nome, ordem) values ('2f8c66f6-ab3b-4d07-a15f-c561c623104e', '0f72c0cd-f5c0-4045-a999-7bd4bb710241', 'Fábio', 0);
insert into public.horarios (prestador_id, dia_semana, abre_min, fecha_min) values ('0f72c0cd-f5c0-4045-a999-7bd4bb710241', 1, 420, 720), ('0f72c0cd-f5c0-4045-a999-7bd4bb710241', 2, 420, 720), ('0f72c0cd-f5c0-4045-a999-7bd4bb710241', 3, 900, 1200), ('0f72c0cd-f5c0-4045-a999-7bd4bb710241', 4, 900, 1200), ('0f72c0cd-f5c0-4045-a999-7bd4bb710241', 5, 420, 720), ('0f72c0cd-f5c0-4045-a999-7bd4bb710241', 6, 480, 720);
insert into public.servicos (id, prestador_id, nome, tipo, especies, preco_a_partir, ativo) values ('5d6eca2a-d0b5-4bca-a4ee-d127cc20bbf8', '0f72c0cd-f5c0-4045-a999-7bd4bb710241', 'Aula de adestramento', 'adestramento', '{"cao"}', false, true);
insert into public.servico_portes (servico_id, porte, duracao_min, preco) values ('5d6eca2a-d0b5-4bca-a4ee-d127cc20bbf8', 'mini', 60, 170), ('5d6eca2a-d0b5-4bca-a4ee-d127cc20bbf8', 'pequeno', 60, 170), ('5d6eca2a-d0b5-4bca-a4ee-d127cc20bbf8', 'medio', 60, 170), ('5d6eca2a-d0b5-4bca-a4ee-d127cc20bbf8', 'grande', 60, 170), ('5d6eca2a-d0b5-4bca-a4ee-d127cc20bbf8', 'gigante', 60, 170);
insert into public.servicos (id, prestador_id, nome, tipo, especies, preco_a_partir, ativo) values ('db4d079f-b23c-4e47-a3f6-2f82fa5ec52a', '0f72c0cd-f5c0-4045-a999-7bd4bb710241', 'Avaliação comportamental', 'adestramento', '{"cao"}', false, true);
insert into public.servico_portes (servico_id, porte, duracao_min, preco) values ('db4d079f-b23c-4e47-a3f6-2f82fa5ec52a', 'mini', 45, 130), ('db4d079f-b23c-4e47-a3f6-2f82fa5ec52a', 'pequeno', 45, 130), ('db4d079f-b23c-4e47-a3f6-2f82fa5ec52a', 'medio', 45, 130), ('db4d079f-b23c-4e47-a3f6-2f82fa5ec52a', 'grande', 45, 130), ('db4d079f-b23c-4e47-a3f6-2f82fa5ec52a', 'gigante', 45, 130);

-- São Caetano Pet Spa
insert into public.prestadores (id, slug, nome, tipos, descricao, endereco, bairro, telefone, lat, lng, passo_min, limpeza_min, antecedencia_min, janela_cancelamento_h, pagamentos, cor, emoji) values ('df9f37bc-cbac-410b-a318-b35fd1992582', 'sao-caetano-pet-spa', 'São Caetano Pet Spa', '{"banho_tosa","petshop"}', 'Banho com ozônio, tosa da raça e espaço só para gatos às quartas.', 'Rua Manoel Coelho, 610', 'Santa Paula, São Caetano do Sul', '(11) 4191-0018', -23.6176, -46.5655, 30, 15, 120, 2, '{"Pix","Cartão de crédito","Cartão de débito"}', '#0ea5e9', '🛁');
insert into public.profissionais (id, prestador_id, nome, ordem) values ('13c2c945-0e78-48d4-a904-1696a71afb6f', 'df9f37bc-cbac-410b-a318-b35fd1992582', 'Mirela', 0), ('e78a366f-808d-41a4-a132-914510fb477b', 'df9f37bc-cbac-410b-a318-b35fd1992582', 'Tati', 1);
insert into public.horarios (prestador_id, dia_semana, abre_min, fecha_min) values ('df9f37bc-cbac-410b-a318-b35fd1992582', 1, 480, 1080), ('df9f37bc-cbac-410b-a318-b35fd1992582', 2, 480, 1080), ('df9f37bc-cbac-410b-a318-b35fd1992582', 3, 480, 1080), ('df9f37bc-cbac-410b-a318-b35fd1992582', 4, 480, 1080), ('df9f37bc-cbac-410b-a318-b35fd1992582', 5, 480, 1080), ('df9f37bc-cbac-410b-a318-b35fd1992582', 6, 480, 960);
insert into public.servicos (id, prestador_id, nome, tipo, especies, preco_a_partir, ativo) values ('897119f4-6aeb-437d-a17d-844f27b4f9e6', 'df9f37bc-cbac-410b-a318-b35fd1992582', 'Banho', 'banho_tosa', '{"cao","gato"}', false, true);
insert into public.servico_portes (servico_id, porte, duracao_min, preco) values ('897119f4-6aeb-437d-a17d-844f27b4f9e6', 'mini', 45, 75), ('897119f4-6aeb-437d-a17d-844f27b4f9e6', 'pequeno', 60, 85), ('897119f4-6aeb-437d-a17d-844f27b4f9e6', 'medio', 75, 100), ('897119f4-6aeb-437d-a17d-844f27b4f9e6', 'grande', 90, 120), ('897119f4-6aeb-437d-a17d-844f27b4f9e6', 'gigante', 120, 145);
insert into public.servicos (id, prestador_id, nome, tipo, especies, preco_a_partir, ativo) values ('af24fb0c-b255-4f69-a392-7feac77f2317', 'df9f37bc-cbac-410b-a318-b35fd1992582', 'Banho e tosa', 'banho_tosa', '{"cao","gato"}', false, true);
insert into public.servico_portes (servico_id, porte, duracao_min, preco) values ('af24fb0c-b255-4f69-a392-7feac77f2317', 'mini', 75, 120), ('af24fb0c-b255-4f69-a392-7feac77f2317', 'pequeno', 90, 135), ('af24fb0c-b255-4f69-a392-7feac77f2317', 'medio', 105, 155), ('af24fb0c-b255-4f69-a392-7feac77f2317', 'grande', 120, 180), ('af24fb0c-b255-4f69-a392-7feac77f2317', 'gigante', 150, 210);
insert into public.servicos (id, prestador_id, nome, tipo, especies, preco_a_partir, ativo) values ('2b936b89-e4e8-422f-aa3b-898ea5be8500', 'df9f37bc-cbac-410b-a318-b35fd1992582', 'Tosa higiênica', 'banho_tosa', '{"cao","gato"}', false, true);
insert into public.servico_portes (servico_id, porte, duracao_min, preco) values ('2b936b89-e4e8-422f-aa3b-898ea5be8500', 'mini', 30, 45), ('2b936b89-e4e8-422f-aa3b-898ea5be8500', 'pequeno', 30, 45), ('2b936b89-e4e8-422f-aa3b-898ea5be8500', 'medio', 30, 45), ('2b936b89-e4e8-422f-aa3b-898ea5be8500', 'grande', 30, 45), ('2b936b89-e4e8-422f-aa3b-898ea5be8500', 'gigante', 30, 45);
insert into public.servicos (id, prestador_id, nome, tipo, especies, preco_a_partir, ativo) values ('c86cdc5a-1fde-4d62-af87-9bba686d95bd', 'df9f37bc-cbac-410b-a318-b35fd1992582', 'Hidratação de pelos', 'petshop', '{"cao","gato"}', false, true);
insert into public.servico_portes (servico_id, porte, duracao_min, preco) values ('c86cdc5a-1fde-4d62-af87-9bba686d95bd', 'mini', 30, 40), ('c86cdc5a-1fde-4d62-af87-9bba686d95bd', 'pequeno', 30, 40), ('c86cdc5a-1fde-4d62-af87-9bba686d95bd', 'medio', 30, 50), ('c86cdc5a-1fde-4d62-af87-9bba686d95bd', 'grande', 30, 60), ('c86cdc5a-1fde-4d62-af87-9bba686d95bd', 'gigante', 30, 70);
insert into public.servicos (id, prestador_id, nome, tipo, especies, preco_a_partir, ativo) values ('7d6144f0-2a81-4239-a334-10ce828fdf54', 'df9f37bc-cbac-410b-a318-b35fd1992582', 'Corte de unhas', 'petshop', '{"cao","gato"}', false, true);
insert into public.servico_portes (servico_id, porte, duracao_min, preco) values ('7d6144f0-2a81-4239-a334-10ce828fdf54', 'mini', 15, 20), ('7d6144f0-2a81-4239-a334-10ce828fdf54', 'pequeno', 15, 20), ('7d6144f0-2a81-4239-a334-10ce828fdf54', 'medio', 15, 20), ('7d6144f0-2a81-4239-a334-10ce828fdf54', 'grande', 15, 20), ('7d6144f0-2a81-4239-a334-10ce828fdf54', 'gigante', 15, 20);

-- Vet Barcelona
insert into public.prestadores (id, slug, nome, tipos, descricao, endereco, bairro, telefone, lat, lng, passo_min, limpeza_min, antecedencia_min, janela_cancelamento_h, pagamentos, cor, emoji) values ('5b6b96c0-d498-493c-a88b-0cdcedd6ca04', 'vet-barcelona-sao-caetano', 'Vet Barcelona', '{"veterinario","petshop"}', 'Consultório veterinário com pet shop.', 'Rua Oswaldo Cruz, 250', 'Barcelona, São Caetano do Sul', '(11) 4191-0019', -23.6297, -46.5603, 15, 0, 120, 2, '{"Pix","Cartão de crédito","Cartão de débito"}', '#f59e0b', '🦴');
insert into public.profissionais (id, prestador_id, nome, ordem) values ('0c5d24a6-a83f-4e33-a71c-0970b5083049', '5b6b96c0-d498-493c-a88b-0cdcedd6ca04', 'Dra. Bruna', 0);
insert into public.horarios (prestador_id, dia_semana, abre_min, fecha_min) values ('5b6b96c0-d498-493c-a88b-0cdcedd6ca04', 1, 480, 1080), ('5b6b96c0-d498-493c-a88b-0cdcedd6ca04', 2, 480, 1080), ('5b6b96c0-d498-493c-a88b-0cdcedd6ca04', 3, 480, 1080), ('5b6b96c0-d498-493c-a88b-0cdcedd6ca04', 4, 480, 1080), ('5b6b96c0-d498-493c-a88b-0cdcedd6ca04', 5, 480, 1080), ('5b6b96c0-d498-493c-a88b-0cdcedd6ca04', 6, 480, 840);
insert into public.servicos (id, prestador_id, nome, tipo, especies, preco_a_partir, ativo) values ('40de0677-61fe-4012-ae79-b7be08ba2252', '5b6b96c0-d498-493c-a88b-0cdcedd6ca04', 'Consulta clínica', 'veterinario', '{"cao","gato","outro"}', false, true);
insert into public.servico_portes (servico_id, porte, duracao_min, preco) values ('40de0677-61fe-4012-ae79-b7be08ba2252', 'mini', 30, 200), ('40de0677-61fe-4012-ae79-b7be08ba2252', 'pequeno', 30, 200), ('40de0677-61fe-4012-ae79-b7be08ba2252', 'medio', 30, 200), ('40de0677-61fe-4012-ae79-b7be08ba2252', 'grande', 30, 200), ('40de0677-61fe-4012-ae79-b7be08ba2252', 'gigante', 30, 200);
insert into public.servicos (id, prestador_id, nome, tipo, especies, preco_a_partir, ativo) values ('b15799d0-9476-4e5c-addd-b708d3543f76', '5b6b96c0-d498-493c-a88b-0cdcedd6ca04', 'Vacinação', 'veterinario', '{"cao","gato"}', true, true);
insert into public.servico_portes (servico_id, porte, duracao_min, preco) values ('b15799d0-9476-4e5c-addd-b708d3543f76', 'mini', 15, 100), ('b15799d0-9476-4e5c-addd-b708d3543f76', 'pequeno', 15, 100), ('b15799d0-9476-4e5c-addd-b708d3543f76', 'medio', 15, 100), ('b15799d0-9476-4e5c-addd-b708d3543f76', 'grande', 15, 100), ('b15799d0-9476-4e5c-addd-b708d3543f76', 'gigante', 15, 100);
insert into public.servicos (id, prestador_id, nome, tipo, especies, preco_a_partir, ativo) values ('20fef784-5647-474d-a844-cea4054c8e5e', '5b6b96c0-d498-493c-a88b-0cdcedd6ca04', 'Corte de unhas', 'petshop', '{"cao","gato"}', false, true);
insert into public.servico_portes (servico_id, porte, duracao_min, preco) values ('20fef784-5647-474d-a844-cea4054c8e5e', 'mini', 15, 15), ('20fef784-5647-474d-a844-cea4054c8e5e', 'pequeno', 15, 15), ('20fef784-5647-474d-a844-cea4054c8e5e', 'medio', 15, 15), ('20fef784-5647-474d-a844-cea4054c8e5e', 'grande', 15, 15), ('20fef784-5647-474d-a844-cea4054c8e5e', 'gigante', 15, 15);

-- avaliações de exemplo
insert into public.avaliacoes (prestador_id, autor, estrelas, texto, criado_em) values
  ('42fcd9fa-19bc-4bff-a3dc-4a7e282899b8', 'Fernanda', 5, 'Ambiente limpo e organizado.', '2026-07-29T03:00:00.000Z'),
  ('42fcd9fa-19bc-4bff-a3dc-4a7e282899b8', 'Gustavo', 3, 'Bom, mas atrasou uns 15 minutos.', '2026-10-31T03:00:00.000Z'),
  ('42fcd9fa-19bc-4bff-a3dc-4a7e282899b8', 'Marina', 4, '', '2026-10-21T03:00:00.000Z'),
  ('42fcd9fa-19bc-4bff-a3dc-4a7e282899b8', 'Tatiane', 4, 'Melhor da região, sempre volto.', '2026-11-19T03:00:00.000Z'),
  ('42fcd9fa-19bc-4bff-a3dc-4a7e282899b8', 'Larissa', 4, 'Pontuais e cuidadosos. Recomendo.', '2026-07-27T03:00:00.000Z'),
  ('42fcd9fa-19bc-4bff-a3dc-4a7e282899b8', 'Fernanda', 5, 'Melhor da região, sempre volto.', '2026-09-08T03:00:00.000Z'),
  ('42fcd9fa-19bc-4bff-a3dc-4a7e282899b8', 'Tatiane', 5, 'Melhor da região, sempre volto.', '2026-08-21T03:00:00.000Z'),
  ('42fcd9fa-19bc-4bff-a3dc-4a7e282899b8', 'André', 5, 'Melhor da região, sempre volto.', '2026-11-18T03:00:00.000Z'),
  ('42fcd9fa-19bc-4bff-a3dc-4a7e282899b8', 'Beatriz', 5, 'Bom, mas atrasou uns 15 minutos.', '2026-08-14T03:00:00.000Z'),
  ('46a7838f-39e2-4135-afee-ad364bf0856e', 'Marina', 5, 'Atendimento ótimo, meu cachorro voltou tranquilo.', '2026-11-20T03:00:00.000Z'),
  ('46a7838f-39e2-4135-afee-ad364bf0856e', 'Gustavo', 4, '', '2026-09-16T03:00:00.000Z'),
  ('46a7838f-39e2-4135-afee-ad364bf0856e', 'Gustavo', 4, 'Bom, mas atrasou uns 15 minutos.', '2026-08-19T03:00:00.000Z'),
  ('46a7838f-39e2-4135-afee-ad364bf0856e', 'Marina', 3, 'Ambiente limpo e organizado.', '2026-09-27T03:00:00.000Z'),
  ('46a7838f-39e2-4135-afee-ad364bf0856e', 'Larissa', 4, 'Bom, mas atrasou uns 15 minutos.', '2026-09-28T03:00:00.000Z'),
  ('46a7838f-39e2-4135-afee-ad364bf0856e', 'Marina', 5, '', '2026-10-11T03:00:00.000Z'),
  ('46a7838f-39e2-4135-afee-ad364bf0856e', 'Rodrigo', 5, 'Bom, mas atrasou uns 15 minutos.', '2026-10-18T03:00:00.000Z'),
  ('46a7838f-39e2-4135-afee-ad364bf0856e', 'Gustavo', 5, 'Atendimento ótimo, meu cachorro voltou tranquilo.', '2026-10-30T03:00:00.000Z'),
  ('46a7838f-39e2-4135-afee-ad364bf0856e', 'Juliana', 5, 'Pontuais e cuidadosos. Recomendo.', '2026-11-23T03:00:00.000Z'),
  ('46a7838f-39e2-4135-afee-ad364bf0856e', 'Larissa', 5, 'Ambiente limpo e organizado.', '2026-10-14T03:00:00.000Z'),
  ('46a7838f-39e2-4135-afee-ad364bf0856e', 'Juliana', 5, 'Bom, mas atrasou uns 15 minutos.', '2026-08-18T03:00:00.000Z'),
  ('46a7838f-39e2-4135-afee-ad364bf0856e', 'Paulo', 5, 'Melhor da região, sempre volto.', '2026-10-12T03:00:00.000Z'),
  ('46a7838f-39e2-4135-afee-ad364bf0856e', 'Larissa', 5, 'Bom, mas atrasou uns 15 minutos.', '2026-07-29T03:00:00.000Z'),
  ('46a7838f-39e2-4135-afee-ad364bf0856e', 'Marina', 5, '', '2026-08-13T03:00:00.000Z'),
  ('46a7838f-39e2-4135-afee-ad364bf0856e', 'Juliana', 5, 'Melhor da região, sempre volto.', '2026-09-09T03:00:00.000Z'),
  ('46a7838f-39e2-4135-afee-ad364bf0856e', 'Ricardo', 3, 'Gostei muito, preço justo.', '2026-09-08T03:00:00.000Z'),
  ('46a7838f-39e2-4135-afee-ad364bf0856e', 'Juliana', 4, 'Equipe atenciosa, explicaram tudo.', '2026-10-20T03:00:00.000Z'),
  ('46a7838f-39e2-4135-afee-ad364bf0856e', 'Larissa', 5, 'Melhor da região, sempre volto.', '2026-09-23T03:00:00.000Z'),
  ('46a7838f-39e2-4135-afee-ad364bf0856e', 'Gustavo', 5, '', '2026-11-19T03:00:00.000Z'),
  ('30914b13-48c3-409d-a16d-ae2e442063a7', 'Ricardo', 5, '', '2026-11-09T03:00:00.000Z'),
  ('30914b13-48c3-409d-a16d-ae2e442063a7', 'Rodrigo', 4, 'Gostei muito, preço justo.', '2026-09-12T03:00:00.000Z'),
  ('30914b13-48c3-409d-a16d-ae2e442063a7', 'Tatiane', 5, 'Atendimento ótimo, meu cachorro voltou tranquilo.', '2026-08-04T03:00:00.000Z'),
  ('30914b13-48c3-409d-a16d-ae2e442063a7', 'André', 5, 'Pontuais e cuidadosos. Recomendo.', '2026-11-16T03:00:00.000Z'),
  ('30914b13-48c3-409d-a16d-ae2e442063a7', 'Ricardo', 5, 'Pontuais e cuidadosos. Recomendo.', '2026-10-16T03:00:00.000Z'),
  ('30914b13-48c3-409d-a16d-ae2e442063a7', 'Juliana', 5, 'Equipe atenciosa, explicaram tudo.', '2026-09-25T03:00:00.000Z'),
  ('30914b13-48c3-409d-a16d-ae2e442063a7', 'Ricardo', 3, 'Ambiente limpo e organizado.', '2026-11-23T03:00:00.000Z'),
  ('2f955f45-d069-40eb-a8bf-d15ecf4d00fa', 'Rodrigo', 3, 'Equipe atenciosa, explicaram tudo.', '2026-09-24T03:00:00.000Z'),
  ('2f955f45-d069-40eb-a8bf-d15ecf4d00fa', 'Marina', 4, 'Bom, mas atrasou uns 15 minutos.', '2026-10-08T03:00:00.000Z'),
  ('2f955f45-d069-40eb-a8bf-d15ecf4d00fa', 'Paulo', 5, 'Ambiente limpo e organizado.', '2026-07-28T03:00:00.000Z'),
  ('5b540b8c-3626-4001-ad2c-4b6cb86b73e1', 'Tatiane', 5, 'Ambiente limpo e organizado.', '2026-08-07T03:00:00.000Z'),
  ('5b540b8c-3626-4001-ad2c-4b6cb86b73e1', 'André', 4, 'Equipe atenciosa, explicaram tudo.', '2026-09-01T03:00:00.000Z'),
  ('5b540b8c-3626-4001-ad2c-4b6cb86b73e1', 'André', 4, 'Melhor da região, sempre volto.', '2026-11-09T03:00:00.000Z'),
  ('5b540b8c-3626-4001-ad2c-4b6cb86b73e1', 'Marina', 4, 'Gostei muito, preço justo.', '2026-10-23T03:00:00.000Z'),
  ('5b540b8c-3626-4001-ad2c-4b6cb86b73e1', 'Beatriz', 5, 'Ambiente limpo e organizado.', '2026-08-18T03:00:00.000Z'),
  ('5b540b8c-3626-4001-ad2c-4b6cb86b73e1', 'Marina', 5, 'Atendimento ótimo, meu cachorro voltou tranquilo.', '2026-11-14T03:00:00.000Z'),
  ('5b540b8c-3626-4001-ad2c-4b6cb86b73e1', 'André', 5, 'Atendimento ótimo, meu cachorro voltou tranquilo.', '2026-08-27T03:00:00.000Z'),
  ('5b540b8c-3626-4001-ad2c-4b6cb86b73e1', 'André', 5, '', '2026-08-18T03:00:00.000Z'),
  ('5b540b8c-3626-4001-ad2c-4b6cb86b73e1', 'Tatiane', 5, 'Melhor da região, sempre volto.', '2026-11-14T03:00:00.000Z'),
  ('5b540b8c-3626-4001-ad2c-4b6cb86b73e1', 'Ricardo', 4, 'Melhor da região, sempre volto.', '2026-11-12T03:00:00.000Z'),
  ('5b540b8c-3626-4001-ad2c-4b6cb86b73e1', 'Camila', 5, 'Ambiente limpo e organizado.', '2026-11-02T03:00:00.000Z'),
  ('5b540b8c-3626-4001-ad2c-4b6cb86b73e1', 'Tatiane', 5, 'Bom, mas atrasou uns 15 minutos.', '2026-09-21T03:00:00.000Z'),
  ('5b540b8c-3626-4001-ad2c-4b6cb86b73e1', 'Larissa', 5, 'Melhor da região, sempre volto.', '2026-11-11T03:00:00.000Z'),
  ('5b540b8c-3626-4001-ad2c-4b6cb86b73e1', 'Tatiane', 5, 'Pontuais e cuidadosos. Recomendo.', '2026-09-16T03:00:00.000Z'),
  ('5b540b8c-3626-4001-ad2c-4b6cb86b73e1', 'Gustavo', 5, 'Atendimento ótimo, meu cachorro voltou tranquilo.', '2026-09-06T03:00:00.000Z'),
  ('5b540b8c-3626-4001-ad2c-4b6cb86b73e1', 'Marina', 5, 'Bom, mas atrasou uns 15 minutos.', '2026-11-23T03:00:00.000Z'),
  ('5b540b8c-3626-4001-ad2c-4b6cb86b73e1', 'Marina', 5, 'Pontuais e cuidadosos. Recomendo.', '2026-11-11T03:00:00.000Z'),
  ('5b540b8c-3626-4001-ad2c-4b6cb86b73e1', 'Marina', 4, 'Atendimento ótimo, meu cachorro voltou tranquilo.', '2026-09-13T03:00:00.000Z'),
  ('5b540b8c-3626-4001-ad2c-4b6cb86b73e1', 'Fernanda', 4, 'Ambiente limpo e organizado.', '2026-10-08T03:00:00.000Z'),
  ('5b540b8c-3626-4001-ad2c-4b6cb86b73e1', 'Ricardo', 4, 'Atendimento ótimo, meu cachorro voltou tranquilo.', '2026-08-28T03:00:00.000Z'),
  ('5b540b8c-3626-4001-ad2c-4b6cb86b73e1', 'Rodrigo', 5, 'Pontuais e cuidadosos. Recomendo.', '2026-11-08T03:00:00.000Z'),
  ('5b540b8c-3626-4001-ad2c-4b6cb86b73e1', 'Marina', 5, 'Ambiente limpo e organizado.', '2026-10-30T03:00:00.000Z'),
  ('5b540b8c-3626-4001-ad2c-4b6cb86b73e1', 'Tatiane', 3, 'Pontuais e cuidadosos. Recomendo.', '2026-08-26T03:00:00.000Z'),
  ('5b540b8c-3626-4001-ad2c-4b6cb86b73e1', 'Marina', 5, '', '2026-08-26T03:00:00.000Z'),
  ('b10dc682-582a-46fb-abf0-892f0d8112ab', 'Paulo', 5, 'Ambiente limpo e organizado.', '2026-09-28T03:00:00.000Z'),
  ('b10dc682-582a-46fb-abf0-892f0d8112ab', 'Camila', 4, '', '2026-08-22T03:00:00.000Z'),
  ('b10dc682-582a-46fb-abf0-892f0d8112ab', 'Fernanda', 4, 'Equipe atenciosa, explicaram tudo.', '2026-08-22T03:00:00.000Z'),
  ('b10dc682-582a-46fb-abf0-892f0d8112ab', 'Ricardo', 5, 'Atendimento ótimo, meu cachorro voltou tranquilo.', '2026-11-03T03:00:00.000Z'),
  ('b10dc682-582a-46fb-abf0-892f0d8112ab', 'Gustavo', 5, 'Bom, mas atrasou uns 15 minutos.', '2026-11-01T03:00:00.000Z'),
  ('b10dc682-582a-46fb-abf0-892f0d8112ab', 'Juliana', 5, '', '2026-09-01T03:00:00.000Z'),
  ('b10dc682-582a-46fb-abf0-892f0d8112ab', 'Ricardo', 4, '', '2026-09-30T03:00:00.000Z'),
  ('b10dc682-582a-46fb-abf0-892f0d8112ab', 'Fernanda', 4, 'Atendimento ótimo, meu cachorro voltou tranquilo.', '2026-09-22T03:00:00.000Z'),
  ('b10dc682-582a-46fb-abf0-892f0d8112ab', 'Ricardo', 5, 'Melhor da região, sempre volto.', '2026-08-27T03:00:00.000Z'),
  ('b10dc682-582a-46fb-abf0-892f0d8112ab', 'Juliana', 5, 'Gostei muito, preço justo.', '2026-10-23T03:00:00.000Z'),
  ('b10dc682-582a-46fb-abf0-892f0d8112ab', 'Fernanda', 5, 'Pontuais e cuidadosos. Recomendo.', '2026-08-06T03:00:00.000Z'),
  ('b10dc682-582a-46fb-abf0-892f0d8112ab', 'Rodrigo', 5, 'Equipe atenciosa, explicaram tudo.', '2026-09-30T03:00:00.000Z'),
  ('b10dc682-582a-46fb-abf0-892f0d8112ab', 'André', 5, 'Melhor da região, sempre volto.', '2026-11-14T03:00:00.000Z'),
  ('b10dc682-582a-46fb-abf0-892f0d8112ab', 'Gustavo', 4, '', '2026-10-03T03:00:00.000Z'),
  ('b10dc682-582a-46fb-abf0-892f0d8112ab', 'Rodrigo', 5, 'Melhor da região, sempre volto.', '2026-08-18T03:00:00.000Z'),
  ('b10dc682-582a-46fb-abf0-892f0d8112ab', 'Tatiane', 4, '', '2026-10-28T03:00:00.000Z'),
  ('b10dc682-582a-46fb-abf0-892f0d8112ab', 'André', 5, 'Bom, mas atrasou uns 15 minutos.', '2026-07-28T03:00:00.000Z'),
  ('b10dc682-582a-46fb-abf0-892f0d8112ab', 'Paulo', 5, 'Ambiente limpo e organizado.', '2026-08-17T03:00:00.000Z'),
  ('b10dc682-582a-46fb-abf0-892f0d8112ab', 'Rodrigo', 5, 'Pontuais e cuidadosos. Recomendo.', '2026-11-15T03:00:00.000Z'),
  ('b10dc682-582a-46fb-abf0-892f0d8112ab', 'Larissa', 5, 'Atendimento ótimo, meu cachorro voltou tranquilo.', '2026-08-27T03:00:00.000Z'),
  ('b10dc682-582a-46fb-abf0-892f0d8112ab', 'Fernanda', 5, 'Atendimento ótimo, meu cachorro voltou tranquilo.', '2026-11-21T03:00:00.000Z'),
  ('b10dc682-582a-46fb-abf0-892f0d8112ab', 'Marina', 5, 'Pontuais e cuidadosos. Recomendo.', '2026-09-07T03:00:00.000Z'),
  ('b10dc682-582a-46fb-abf0-892f0d8112ab', 'Gustavo', 4, 'Melhor da região, sempre volto.', '2026-10-17T03:00:00.000Z'),
  ('7eb0468a-5498-458b-a670-517840a08fc4', 'Rodrigo', 5, 'Bom, mas atrasou uns 15 minutos.', '2026-11-10T03:00:00.000Z'),
  ('7eb0468a-5498-458b-a670-517840a08fc4', 'Beatriz', 3, 'Equipe atenciosa, explicaram tudo.', '2026-11-19T03:00:00.000Z'),
  ('7eb0468a-5498-458b-a670-517840a08fc4', 'Ricardo', 4, 'Pontuais e cuidadosos. Recomendo.', '2026-08-13T03:00:00.000Z'),
  ('7eb0468a-5498-458b-a670-517840a08fc4', 'Fernanda', 5, 'Bom, mas atrasou uns 15 minutos.', '2026-09-06T03:00:00.000Z'),
  ('7eb0468a-5498-458b-a670-517840a08fc4', 'Rodrigo', 5, 'Pontuais e cuidadosos. Recomendo.', '2026-09-16T03:00:00.000Z'),
  ('7eb0468a-5498-458b-a670-517840a08fc4', 'Paulo', 5, 'Equipe atenciosa, explicaram tudo.', '2026-10-26T03:00:00.000Z'),
  ('7eb0468a-5498-458b-a670-517840a08fc4', 'André', 5, '', '2026-09-21T03:00:00.000Z'),
  ('7eb0468a-5498-458b-a670-517840a08fc4', 'Marina', 5, '', '2026-10-04T03:00:00.000Z'),
  ('7eb0468a-5498-458b-a670-517840a08fc4', 'Juliana', 4, 'Pontuais e cuidadosos. Recomendo.', '2026-09-22T03:00:00.000Z'),
  ('7eb0468a-5498-458b-a670-517840a08fc4', 'Paulo', 5, 'Pontuais e cuidadosos. Recomendo.', '2026-09-11T03:00:00.000Z'),
  ('7eb0468a-5498-458b-a670-517840a08fc4', 'Ricardo', 5, '', '2026-10-01T03:00:00.000Z'),
  ('7eb0468a-5498-458b-a670-517840a08fc4', 'Larissa', 5, 'Equipe atenciosa, explicaram tudo.', '2026-08-02T03:00:00.000Z'),
  ('7eb0468a-5498-458b-a670-517840a08fc4', 'Gustavo', 5, 'Gostei muito, preço justo.', '2026-10-02T03:00:00.000Z'),
  ('7eb0468a-5498-458b-a670-517840a08fc4', 'Marina', 5, '', '2026-10-30T03:00:00.000Z'),
  ('7eb0468a-5498-458b-a670-517840a08fc4', 'Paulo', 5, 'Melhor da região, sempre volto.', '2026-10-18T03:00:00.000Z'),
  ('7eb0468a-5498-458b-a670-517840a08fc4', 'Marina', 5, 'Ambiente limpo e organizado.', '2026-09-26T03:00:00.000Z'),
  ('7eb0468a-5498-458b-a670-517840a08fc4', 'Fernanda', 5, 'Melhor da região, sempre volto.', '2026-10-13T03:00:00.000Z'),
  ('7eb0468a-5498-458b-a670-517840a08fc4', 'Marina', 5, 'Melhor da região, sempre volto.', '2026-08-10T03:00:00.000Z'),
  ('7eb0468a-5498-458b-a670-517840a08fc4', 'Gustavo', 5, 'Gostei muito, preço justo.', '2026-10-22T03:00:00.000Z'),
  ('7eb0468a-5498-458b-a670-517840a08fc4', 'Beatriz', 5, 'Ambiente limpo e organizado.', '2026-09-27T03:00:00.000Z'),
  ('7eb0468a-5498-458b-a670-517840a08fc4', 'Ricardo', 4, '', '2026-08-09T03:00:00.000Z'),
  ('7eb0468a-5498-458b-a670-517840a08fc4', 'Marina', 5, 'Gostei muito, preço justo.', '2026-09-21T03:00:00.000Z'),
  ('7eb0468a-5498-458b-a670-517840a08fc4', 'Marina', 5, 'Melhor da região, sempre volto.', '2026-11-20T03:00:00.000Z'),
  ('7eb0468a-5498-458b-a670-517840a08fc4', 'Rodrigo', 5, 'Ambiente limpo e organizado.', '2026-08-29T03:00:00.000Z'),
  ('7eb0468a-5498-458b-a670-517840a08fc4', 'Tatiane', 4, 'Melhor da região, sempre volto.', '2026-08-25T03:00:00.000Z'),
  ('7eb0468a-5498-458b-a670-517840a08fc4', 'Rodrigo', 5, 'Equipe atenciosa, explicaram tudo.', '2026-10-30T03:00:00.000Z'),
  ('4b10f564-8a53-4878-a509-bdbffd339efc', 'Tatiane', 3, 'Pontuais e cuidadosos. Recomendo.', '2026-09-04T03:00:00.000Z'),
  ('4b10f564-8a53-4878-a509-bdbffd339efc', 'Tatiane', 5, 'Ambiente limpo e organizado.', '2026-08-16T03:00:00.000Z'),
  ('4b10f564-8a53-4878-a509-bdbffd339efc', 'Marina', 5, 'Pontuais e cuidadosos. Recomendo.', '2026-09-23T03:00:00.000Z'),
  ('4b10f564-8a53-4878-a509-bdbffd339efc', 'Gustavo', 3, 'Gostei muito, preço justo.', '2026-10-09T03:00:00.000Z'),
  ('4b10f564-8a53-4878-a509-bdbffd339efc', 'Juliana', 5, 'Ambiente limpo e organizado.', '2026-08-08T03:00:00.000Z'),
  ('4b10f564-8a53-4878-a509-bdbffd339efc', 'Rodrigo', 5, 'Bom, mas atrasou uns 15 minutos.', '2026-11-19T03:00:00.000Z'),
  ('4b10f564-8a53-4878-a509-bdbffd339efc', 'Gustavo', 4, 'Ambiente limpo e organizado.', '2026-10-22T03:00:00.000Z'),
  ('4b10f564-8a53-4878-a509-bdbffd339efc', 'Gustavo', 5, 'Melhor da região, sempre volto.', '2026-08-17T03:00:00.000Z'),
  ('4b10f564-8a53-4878-a509-bdbffd339efc', 'Larissa', 4, 'Gostei muito, preço justo.', '2026-09-27T03:00:00.000Z'),
  ('4b10f564-8a53-4878-a509-bdbffd339efc', 'Paulo', 5, 'Atendimento ótimo, meu cachorro voltou tranquilo.', '2026-08-26T03:00:00.000Z'),
  ('4b10f564-8a53-4878-a509-bdbffd339efc', 'Paulo', 3, 'Equipe atenciosa, explicaram tudo.', '2026-11-04T03:00:00.000Z'),
  ('4b10f564-8a53-4878-a509-bdbffd339efc', 'André', 5, '', '2026-10-25T03:00:00.000Z'),
  ('4b10f564-8a53-4878-a509-bdbffd339efc', 'Camila', 4, '', '2026-11-05T03:00:00.000Z'),
  ('4b10f564-8a53-4878-a509-bdbffd339efc', 'Rodrigo', 3, 'Ambiente limpo e organizado.', '2026-09-01T03:00:00.000Z'),
  ('4b10f564-8a53-4878-a509-bdbffd339efc', 'Rodrigo', 3, 'Ambiente limpo e organizado.', '2026-11-16T03:00:00.000Z'),
  ('711744fc-8722-409f-aadf-6701e9ef43e2', 'Gustavo', 5, 'Bom, mas atrasou uns 15 minutos.', '2026-09-21T03:00:00.000Z'),
  ('711744fc-8722-409f-aadf-6701e9ef43e2', 'Beatriz', 5, '', '2026-10-17T03:00:00.000Z'),
  ('711744fc-8722-409f-aadf-6701e9ef43e2', 'Camila', 4, 'Melhor da região, sempre volto.', '2026-10-20T03:00:00.000Z'),
  ('711744fc-8722-409f-aadf-6701e9ef43e2', 'Camila', 5, 'Melhor da região, sempre volto.', '2026-08-16T03:00:00.000Z'),
  ('d898f5e8-e966-4a2a-a78a-473adf0e8e44', 'Marina', 5, 'Bom, mas atrasou uns 15 minutos.', '2026-10-05T03:00:00.000Z'),
  ('d898f5e8-e966-4a2a-a78a-473adf0e8e44', 'Rodrigo', 5, 'Bom, mas atrasou uns 15 minutos.', '2026-10-25T03:00:00.000Z'),
  ('d898f5e8-e966-4a2a-a78a-473adf0e8e44', 'Fernanda', 4, 'Ambiente limpo e organizado.', '2026-10-01T03:00:00.000Z'),
  ('d898f5e8-e966-4a2a-a78a-473adf0e8e44', 'Larissa', 5, 'Equipe atenciosa, explicaram tudo.', '2026-10-07T03:00:00.000Z'),
  ('d898f5e8-e966-4a2a-a78a-473adf0e8e44', 'Marina', 5, 'Pontuais e cuidadosos. Recomendo.', '2026-09-22T03:00:00.000Z'),
  ('d898f5e8-e966-4a2a-a78a-473adf0e8e44', 'Larissa', 5, 'Bom, mas atrasou uns 15 minutos.', '2026-08-13T03:00:00.000Z'),
  ('1b12f9d0-a87a-46e5-ac1d-016c7480bb15', 'Beatriz', 5, 'Melhor da região, sempre volto.', '2026-11-07T03:00:00.000Z'),
  ('1b12f9d0-a87a-46e5-ac1d-016c7480bb15', 'Camila', 5, 'Pontuais e cuidadosos. Recomendo.', '2026-09-15T03:00:00.000Z'),
  ('1b12f9d0-a87a-46e5-ac1d-016c7480bb15', 'Juliana', 5, 'Atendimento ótimo, meu cachorro voltou tranquilo.', '2026-11-13T03:00:00.000Z'),
  ('1b12f9d0-a87a-46e5-ac1d-016c7480bb15', 'Camila', 5, 'Gostei muito, preço justo.', '2026-08-17T03:00:00.000Z'),
  ('1b12f9d0-a87a-46e5-ac1d-016c7480bb15', 'André', 4, 'Melhor da região, sempre volto.', '2026-08-20T03:00:00.000Z'),
  ('1b12f9d0-a87a-46e5-ac1d-016c7480bb15', 'Gustavo', 5, 'Atendimento ótimo, meu cachorro voltou tranquilo.', '2026-10-30T03:00:00.000Z'),
  ('1b12f9d0-a87a-46e5-ac1d-016c7480bb15', 'Juliana', 5, 'Gostei muito, preço justo.', '2026-08-24T03:00:00.000Z'),
  ('1b12f9d0-a87a-46e5-ac1d-016c7480bb15', 'André', 5, 'Bom, mas atrasou uns 15 minutos.', '2026-09-16T03:00:00.000Z'),
  ('1b12f9d0-a87a-46e5-ac1d-016c7480bb15', 'Tatiane', 4, '', '2026-09-04T03:00:00.000Z'),
  ('1b12f9d0-a87a-46e5-ac1d-016c7480bb15', 'Beatriz', 5, 'Equipe atenciosa, explicaram tudo.', '2026-08-06T03:00:00.000Z'),
  ('1b12f9d0-a87a-46e5-ac1d-016c7480bb15', 'André', 5, 'Ambiente limpo e organizado.', '2026-09-29T03:00:00.000Z'),
  ('1b12f9d0-a87a-46e5-ac1d-016c7480bb15', 'Larissa', 5, 'Gostei muito, preço justo.', '2026-10-03T03:00:00.000Z'),
  ('1b12f9d0-a87a-46e5-ac1d-016c7480bb15', 'Camila', 4, 'Gostei muito, preço justo.', '2026-11-23T03:00:00.000Z'),
  ('1b12f9d0-a87a-46e5-ac1d-016c7480bb15', 'André', 5, 'Equipe atenciosa, explicaram tudo.', '2026-09-25T03:00:00.000Z'),
  ('1b12f9d0-a87a-46e5-ac1d-016c7480bb15', 'Gustavo', 4, 'Bom, mas atrasou uns 15 minutos.', '2026-11-19T03:00:00.000Z'),
  ('1b12f9d0-a87a-46e5-ac1d-016c7480bb15', 'Camila', 5, '', '2026-09-17T03:00:00.000Z'),
  ('1b12f9d0-a87a-46e5-ac1d-016c7480bb15', 'Larissa', 5, 'Ambiente limpo e organizado.', '2026-10-01T03:00:00.000Z'),
  ('1b12f9d0-a87a-46e5-ac1d-016c7480bb15', 'Larissa', 5, 'Atendimento ótimo, meu cachorro voltou tranquilo.', '2026-09-17T03:00:00.000Z'),
  ('1b12f9d0-a87a-46e5-ac1d-016c7480bb15', 'Larissa', 5, 'Equipe atenciosa, explicaram tudo.', '2026-11-13T03:00:00.000Z'),
  ('1b12f9d0-a87a-46e5-ac1d-016c7480bb15', 'Beatriz', 4, 'Equipe atenciosa, explicaram tudo.', '2026-09-07T03:00:00.000Z'),
  ('1b12f9d0-a87a-46e5-ac1d-016c7480bb15', 'André', 4, 'Atendimento ótimo, meu cachorro voltou tranquilo.', '2026-11-16T03:00:00.000Z'),
  ('1b12f9d0-a87a-46e5-ac1d-016c7480bb15', 'Rodrigo', 5, 'Ambiente limpo e organizado.', '2026-09-12T03:00:00.000Z'),
  ('1b12f9d0-a87a-46e5-ac1d-016c7480bb15', 'Beatriz', 5, 'Gostei muito, preço justo.', '2026-11-21T03:00:00.000Z'),
  ('1b12f9d0-a87a-46e5-ac1d-016c7480bb15', 'Juliana', 5, 'Gostei muito, preço justo.', '2026-08-21T03:00:00.000Z'),
  ('1b12f9d0-a87a-46e5-ac1d-016c7480bb15', 'Tatiane', 3, 'Atendimento ótimo, meu cachorro voltou tranquilo.', '2026-11-22T03:00:00.000Z'),
  ('1b12f9d0-a87a-46e5-ac1d-016c7480bb15', 'Rodrigo', 4, 'Gostei muito, preço justo.', '2026-10-02T03:00:00.000Z'),
  ('1b12f9d0-a87a-46e5-ac1d-016c7480bb15', 'Camila', 5, 'Equipe atenciosa, explicaram tudo.', '2026-09-12T03:00:00.000Z'),
  ('99a952ff-12ca-4d81-a5f1-0bdb6c160657', 'Marina', 4, 'Gostei muito, preço justo.', '2026-09-23T03:00:00.000Z'),
  ('99a952ff-12ca-4d81-a5f1-0bdb6c160657', 'Rodrigo', 5, 'Melhor da região, sempre volto.', '2026-08-15T03:00:00.000Z'),
  ('bff47848-a10e-4647-a60e-6ba3b55f1c94', 'Gustavo', 4, 'Bom, mas atrasou uns 15 minutos.', '2026-09-05T03:00:00.000Z'),
  ('bff47848-a10e-4647-a60e-6ba3b55f1c94', 'Marina', 4, 'Atendimento ótimo, meu cachorro voltou tranquilo.', '2026-10-10T03:00:00.000Z'),
  ('bff47848-a10e-4647-a60e-6ba3b55f1c94', 'Rodrigo', 5, 'Bom, mas atrasou uns 15 minutos.', '2026-09-30T03:00:00.000Z'),
  ('bff47848-a10e-4647-a60e-6ba3b55f1c94', 'Gustavo', 5, 'Equipe atenciosa, explicaram tudo.', '2026-09-25T03:00:00.000Z'),
  ('bff47848-a10e-4647-a60e-6ba3b55f1c94', 'Marina', 3, 'Atendimento ótimo, meu cachorro voltou tranquilo.', '2026-09-10T03:00:00.000Z'),
  ('bff47848-a10e-4647-a60e-6ba3b55f1c94', 'Larissa', 5, 'Bom, mas atrasou uns 15 minutos.', '2026-07-30T03:00:00.000Z'),
  ('bff47848-a10e-4647-a60e-6ba3b55f1c94', 'Marina', 5, '', '2026-10-10T03:00:00.000Z'),
  ('bff47848-a10e-4647-a60e-6ba3b55f1c94', 'Rodrigo', 5, 'Ambiente limpo e organizado.', '2026-10-13T03:00:00.000Z'),
  ('bff47848-a10e-4647-a60e-6ba3b55f1c94', 'Marina', 5, 'Atendimento ótimo, meu cachorro voltou tranquilo.', '2026-09-02T03:00:00.000Z'),
  ('bff47848-a10e-4647-a60e-6ba3b55f1c94', 'André', 5, 'Melhor da região, sempre volto.', '2026-09-08T03:00:00.000Z'),
  ('bff47848-a10e-4647-a60e-6ba3b55f1c94', 'Fernanda', 4, 'Bom, mas atrasou uns 15 minutos.', '2026-10-12T03:00:00.000Z'),
  ('bff47848-a10e-4647-a60e-6ba3b55f1c94', 'Gustavo', 5, 'Bom, mas atrasou uns 15 minutos.', '2026-11-23T03:00:00.000Z'),
  ('bff47848-a10e-4647-a60e-6ba3b55f1c94', 'Beatriz', 5, 'Bom, mas atrasou uns 15 minutos.', '2026-10-08T03:00:00.000Z'),
  ('bff47848-a10e-4647-a60e-6ba3b55f1c94', 'Larissa', 5, 'Melhor da região, sempre volto.', '2026-08-04T03:00:00.000Z'),
  ('bff47848-a10e-4647-a60e-6ba3b55f1c94', 'Paulo', 5, 'Ambiente limpo e organizado.', '2026-09-25T03:00:00.000Z'),
  ('bff47848-a10e-4647-a60e-6ba3b55f1c94', 'Tatiane', 5, 'Equipe atenciosa, explicaram tudo.', '2026-09-01T03:00:00.000Z'),
  ('bff47848-a10e-4647-a60e-6ba3b55f1c94', 'Ricardo', 5, 'Gostei muito, preço justo.', '2026-10-22T03:00:00.000Z'),
  ('bff47848-a10e-4647-a60e-6ba3b55f1c94', 'Larissa', 5, 'Gostei muito, preço justo.', '2026-10-31T03:00:00.000Z'),
  ('3f2e0ded-cc3c-4211-a1f6-683a153783de', 'Gustavo', 5, 'Bom, mas atrasou uns 15 minutos.', '2026-10-17T03:00:00.000Z'),
  ('3f2e0ded-cc3c-4211-a1f6-683a153783de', 'André', 4, 'Gostei muito, preço justo.', '2026-10-19T03:00:00.000Z'),
  ('3f2e0ded-cc3c-4211-a1f6-683a153783de', 'Rodrigo', 5, 'Atendimento ótimo, meu cachorro voltou tranquilo.', '2026-10-20T03:00:00.000Z'),
  ('3f2e0ded-cc3c-4211-a1f6-683a153783de', 'Ricardo', 3, 'Atendimento ótimo, meu cachorro voltou tranquilo.', '2026-08-31T03:00:00.000Z'),
  ('3f2e0ded-cc3c-4211-a1f6-683a153783de', 'Tatiane', 5, 'Pontuais e cuidadosos. Recomendo.', '2026-10-23T03:00:00.000Z'),
  ('3f2e0ded-cc3c-4211-a1f6-683a153783de', 'Ricardo', 4, 'Atendimento ótimo, meu cachorro voltou tranquilo.', '2026-08-29T03:00:00.000Z'),
  ('3f2e0ded-cc3c-4211-a1f6-683a153783de', 'André', 5, 'Pontuais e cuidadosos. Recomendo.', '2026-10-29T03:00:00.000Z'),
  ('3f2e0ded-cc3c-4211-a1f6-683a153783de', 'André', 4, 'Gostei muito, preço justo.', '2026-08-10T03:00:00.000Z'),
  ('3f2e0ded-cc3c-4211-a1f6-683a153783de', 'Larissa', 5, '', '2026-09-24T03:00:00.000Z'),
  ('3f2e0ded-cc3c-4211-a1f6-683a153783de', 'Marina', 5, 'Ambiente limpo e organizado.', '2026-09-05T03:00:00.000Z'),
  ('3f2e0ded-cc3c-4211-a1f6-683a153783de', 'Tatiane', 5, 'Pontuais e cuidadosos. Recomendo.', '2026-09-28T03:00:00.000Z'),
  ('3f2e0ded-cc3c-4211-a1f6-683a153783de', 'Gustavo', 4, 'Ambiente limpo e organizado.', '2026-08-25T03:00:00.000Z'),
  ('3f2e0ded-cc3c-4211-a1f6-683a153783de', 'Fernanda', 5, 'Atendimento ótimo, meu cachorro voltou tranquilo.', '2026-10-31T03:00:00.000Z'),
  ('3f2e0ded-cc3c-4211-a1f6-683a153783de', 'Fernanda', 5, 'Pontuais e cuidadosos. Recomendo.', '2026-07-28T03:00:00.000Z'),
  ('3f2e0ded-cc3c-4211-a1f6-683a153783de', 'Rodrigo', 4, 'Melhor da região, sempre volto.', '2026-08-06T03:00:00.000Z'),
  ('3f2e0ded-cc3c-4211-a1f6-683a153783de', 'André', 5, 'Ambiente limpo e organizado.', '2026-10-26T03:00:00.000Z'),
  ('3f2e0ded-cc3c-4211-a1f6-683a153783de', 'Beatriz', 5, 'Gostei muito, preço justo.', '2026-09-20T03:00:00.000Z'),
  ('3f2e0ded-cc3c-4211-a1f6-683a153783de', 'Rodrigo', 5, 'Gostei muito, preço justo.', '2026-08-26T03:00:00.000Z'),
  ('3f2e0ded-cc3c-4211-a1f6-683a153783de', 'André', 5, 'Ambiente limpo e organizado.', '2026-10-23T03:00:00.000Z'),
  ('effbc03e-da25-4444-a656-613aa34a56c2', 'Tatiane', 4, 'Equipe atenciosa, explicaram tudo.', '2026-09-04T03:00:00.000Z'),
  ('effbc03e-da25-4444-a656-613aa34a56c2', 'Gustavo', 5, 'Equipe atenciosa, explicaram tudo.', '2026-09-12T03:00:00.000Z'),
  ('effbc03e-da25-4444-a656-613aa34a56c2', 'Rodrigo', 5, '', '2026-11-13T03:00:00.000Z'),
  ('effbc03e-da25-4444-a656-613aa34a56c2', 'Ricardo', 5, 'Equipe atenciosa, explicaram tudo.', '2026-10-18T03:00:00.000Z'),
  ('effbc03e-da25-4444-a656-613aa34a56c2', 'Gustavo', 5, 'Bom, mas atrasou uns 15 minutos.', '2026-08-31T03:00:00.000Z'),
  ('effbc03e-da25-4444-a656-613aa34a56c2', 'Tatiane', 4, 'Gostei muito, preço justo.', '2026-08-07T03:00:00.000Z'),
  ('effbc03e-da25-4444-a656-613aa34a56c2', 'Tatiane', 5, 'Melhor da região, sempre volto.', '2026-09-05T03:00:00.000Z'),
  ('effbc03e-da25-4444-a656-613aa34a56c2', 'Rodrigo', 5, 'Atendimento ótimo, meu cachorro voltou tranquilo.', '2026-10-17T03:00:00.000Z'),
  ('effbc03e-da25-4444-a656-613aa34a56c2', 'Ricardo', 5, 'Bom, mas atrasou uns 15 minutos.', '2026-08-23T03:00:00.000Z'),
  ('effbc03e-da25-4444-a656-613aa34a56c2', 'Tatiane', 5, '', '2026-09-23T03:00:00.000Z'),
  ('effbc03e-da25-4444-a656-613aa34a56c2', 'Paulo', 5, 'Melhor da região, sempre volto.', '2026-09-01T03:00:00.000Z'),
  ('effbc03e-da25-4444-a656-613aa34a56c2', 'Ricardo', 5, 'Bom, mas atrasou uns 15 minutos.', '2026-07-27T03:00:00.000Z'),
  ('effbc03e-da25-4444-a656-613aa34a56c2', 'Tatiane', 5, 'Equipe atenciosa, explicaram tudo.', '2026-10-30T03:00:00.000Z'),
  ('effbc03e-da25-4444-a656-613aa34a56c2', 'Tatiane', 5, 'Bom, mas atrasou uns 15 minutos.', '2026-10-11T03:00:00.000Z'),
  ('effbc03e-da25-4444-a656-613aa34a56c2', 'André', 5, 'Pontuais e cuidadosos. Recomendo.', '2026-11-03T03:00:00.000Z'),
  ('effbc03e-da25-4444-a656-613aa34a56c2', 'Tatiane', 5, '', '2026-08-23T03:00:00.000Z'),
  ('effbc03e-da25-4444-a656-613aa34a56c2', 'Larissa', 4, 'Pontuais e cuidadosos. Recomendo.', '2026-10-02T03:00:00.000Z'),
  ('effbc03e-da25-4444-a656-613aa34a56c2', 'Juliana', 4, 'Ambiente limpo e organizado.', '2026-10-28T03:00:00.000Z'),
  ('6768db63-d4d0-4995-ad8e-e7edb247777e', 'Ricardo', 5, '', '2026-10-07T03:00:00.000Z'),
  ('6768db63-d4d0-4995-ad8e-e7edb247777e', 'Ricardo', 5, 'Melhor da região, sempre volto.', '2026-10-11T03:00:00.000Z'),
  ('6768db63-d4d0-4995-ad8e-e7edb247777e', 'Marina', 3, 'Pontuais e cuidadosos. Recomendo.', '2026-08-30T03:00:00.000Z'),
  ('6768db63-d4d0-4995-ad8e-e7edb247777e', 'André', 4, 'Atendimento ótimo, meu cachorro voltou tranquilo.', '2026-10-07T03:00:00.000Z'),
  ('6768db63-d4d0-4995-ad8e-e7edb247777e', 'Camila', 5, '', '2026-08-19T03:00:00.000Z'),
  ('6768db63-d4d0-4995-ad8e-e7edb247777e', 'Paulo', 3, 'Bom, mas atrasou uns 15 minutos.', '2026-11-06T03:00:00.000Z'),
  ('6768db63-d4d0-4995-ad8e-e7edb247777e', 'Paulo', 4, 'Melhor da região, sempre volto.', '2026-09-21T03:00:00.000Z'),
  ('6768db63-d4d0-4995-ad8e-e7edb247777e', 'Fernanda', 5, 'Ambiente limpo e organizado.', '2026-08-24T03:00:00.000Z'),
  ('6768db63-d4d0-4995-ad8e-e7edb247777e', 'Ricardo', 5, 'Equipe atenciosa, explicaram tudo.', '2026-09-07T03:00:00.000Z'),
  ('6768db63-d4d0-4995-ad8e-e7edb247777e', 'Camila', 4, 'Melhor da região, sempre volto.', '2026-11-04T03:00:00.000Z'),
  ('6768db63-d4d0-4995-ad8e-e7edb247777e', 'Ricardo', 5, 'Equipe atenciosa, explicaram tudo.', '2026-08-25T03:00:00.000Z'),
  ('6768db63-d4d0-4995-ad8e-e7edb247777e', 'Fernanda', 5, 'Melhor da região, sempre volto.', '2026-08-23T03:00:00.000Z'),
  ('6768db63-d4d0-4995-ad8e-e7edb247777e', 'Marina', 5, 'Atendimento ótimo, meu cachorro voltou tranquilo.', '2026-10-24T03:00:00.000Z'),
  ('6768db63-d4d0-4995-ad8e-e7edb247777e', 'Ricardo', 4, 'Pontuais e cuidadosos. Recomendo.', '2026-09-24T03:00:00.000Z'),
  ('6768db63-d4d0-4995-ad8e-e7edb247777e', 'Juliana', 5, 'Pontuais e cuidadosos. Recomendo.', '2026-08-06T03:00:00.000Z'),
  ('0f72c0cd-f5c0-4045-a999-7bd4bb710241', 'Gustavo', 5, 'Bom, mas atrasou uns 15 minutos.', '2026-10-11T03:00:00.000Z'),
  ('0f72c0cd-f5c0-4045-a999-7bd4bb710241', 'Ricardo', 4, '', '2026-11-19T03:00:00.000Z'),
  ('0f72c0cd-f5c0-4045-a999-7bd4bb710241', 'Gustavo', 4, 'Ambiente limpo e organizado.', '2026-09-25T03:00:00.000Z'),
  ('0f72c0cd-f5c0-4045-a999-7bd4bb710241', 'Beatriz', 5, 'Atendimento ótimo, meu cachorro voltou tranquilo.', '2026-10-07T03:00:00.000Z'),
  ('0f72c0cd-f5c0-4045-a999-7bd4bb710241', 'Rodrigo', 4, 'Gostei muito, preço justo.', '2026-10-03T03:00:00.000Z'),
  ('0f72c0cd-f5c0-4045-a999-7bd4bb710241', 'Tatiane', 5, 'Gostei muito, preço justo.', '2026-08-15T03:00:00.000Z'),
  ('df9f37bc-cbac-410b-a318-b35fd1992582', 'André', 5, 'Equipe atenciosa, explicaram tudo.', '2026-11-17T03:00:00.000Z'),
  ('df9f37bc-cbac-410b-a318-b35fd1992582', 'André', 5, 'Atendimento ótimo, meu cachorro voltou tranquilo.', '2026-09-20T03:00:00.000Z'),
  ('df9f37bc-cbac-410b-a318-b35fd1992582', 'Camila', 5, 'Melhor da região, sempre volto.', '2026-11-21T03:00:00.000Z'),
  ('5b6b96c0-d498-493c-a88b-0cdcedd6ca04', 'Beatriz', 4, 'Gostei muito, preço justo.', '2026-11-16T03:00:00.000Z'),
  ('5b6b96c0-d498-493c-a88b-0cdcedd6ca04', 'André', 3, 'Bom, mas atrasou uns 15 minutos.', '2026-08-26T03:00:00.000Z'),
  ('5b6b96c0-d498-493c-a88b-0cdcedd6ca04', 'André', 4, 'Bom, mas atrasou uns 15 minutos.', '2026-10-14T03:00:00.000Z'),
  ('5b6b96c0-d498-493c-a88b-0cdcedd6ca04', 'Marina', 5, 'Pontuais e cuidadosos. Recomendo.', '2026-07-31T03:00:00.000Z'),
  ('5b6b96c0-d498-493c-a88b-0cdcedd6ca04', 'Gustavo', 5, 'Pontuais e cuidadosos. Recomendo.', '2026-08-29T03:00:00.000Z'),
  ('5b6b96c0-d498-493c-a88b-0cdcedd6ca04', 'Tatiane', 5, '', '2026-09-07T03:00:00.000Z'),
  ('5b6b96c0-d498-493c-a88b-0cdcedd6ca04', 'Marina', 5, 'Gostei muito, preço justo.', '2026-10-22T03:00:00.000Z'),
  ('5b6b96c0-d498-493c-a88b-0cdcedd6ca04', 'Gustavo', 3, 'Gostei muito, preço justo.', '2026-08-31T03:00:00.000Z'),
  ('5b6b96c0-d498-493c-a88b-0cdcedd6ca04', 'Paulo', 5, 'Equipe atenciosa, explicaram tudo.', '2026-10-22T03:00:00.000Z'),
  ('5b6b96c0-d498-493c-a88b-0cdcedd6ca04', 'Rodrigo', 5, '', '2026-09-12T03:00:00.000Z'),
  ('5b6b96c0-d498-493c-a88b-0cdcedd6ca04', 'André', 5, 'Gostei muito, preço justo.', '2026-10-19T03:00:00.000Z'),
  ('5b6b96c0-d498-493c-a88b-0cdcedd6ca04', 'Camila', 5, 'Equipe atenciosa, explicaram tudo.', '2026-11-15T03:00:00.000Z'),
  ('5b6b96c0-d498-493c-a88b-0cdcedd6ca04', 'Tatiane', 4, 'Equipe atenciosa, explicaram tudo.', '2026-09-09T03:00:00.000Z'),
  ('5b6b96c0-d498-493c-a88b-0cdcedd6ca04', 'Fernanda', 5, 'Equipe atenciosa, explicaram tudo.', '2026-09-08T03:00:00.000Z'),
  ('5b6b96c0-d498-493c-a88b-0cdcedd6ca04', 'Larissa', 4, 'Pontuais e cuidadosos. Recomendo.', '2026-08-24T03:00:00.000Z'),
  ('5b6b96c0-d498-493c-a88b-0cdcedd6ca04', 'Fernanda', 5, '', '2026-08-11T03:00:00.000Z'),
  ('5b6b96c0-d498-493c-a88b-0cdcedd6ca04', 'Marina', 3, 'Melhor da região, sempre volto.', '2026-09-24T03:00:00.000Z'),
  ('5b6b96c0-d498-493c-a88b-0cdcedd6ca04', 'André', 3, 'Ambiente limpo e organizado.', '2026-09-02T03:00:00.000Z'),
  ('5b6b96c0-d498-493c-a88b-0cdcedd6ca04', 'Gustavo', 5, 'Ambiente limpo e organizado.', '2026-07-28T03:00:00.000Z'),
  ('5b6b96c0-d498-493c-a88b-0cdcedd6ca04', 'Gustavo', 5, 'Ambiente limpo e organizado.', '2026-08-31T03:00:00.000Z'),
  ('5b6b96c0-d498-493c-a88b-0cdcedd6ca04', 'Paulo', 5, '', '2026-08-01T03:00:00.000Z'),
  ('5b6b96c0-d498-493c-a88b-0cdcedd6ca04', 'Gustavo', 3, 'Bom, mas atrasou uns 15 minutos.', '2026-09-01T03:00:00.000Z');

commit;
