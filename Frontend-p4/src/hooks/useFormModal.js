// src/hooks/useFormModal.js
import { useState } from 'react';

export default function useFormModal(addFunction, updateFunction, token) {
    const [modalAberto, setModalAberto] = useState(false);
    const [itemEmEdicao, setItemEmEdicao] = useState(null);

    // Abre para CRIAR (recebe o esqueleto vazio, ex: {nome: '', email: ''})
    const abrirParaCriar = (dadosIniciais) => {
        setItemEmEdicao(dadosIniciais);
        setModalAberto(true);
    };

    // Abre para EDITAR (recebe o item existente)
    const abrirParaEditar = (e, item) => {
        if (e) e.stopPropagation(); // Impede cliques indesejados nas listas
        setItemEmEdicao(item);
        setModalAberto(true);
    };

    const fecharModal = () => {
        setModalAberto(false);
        setItemEmEdicao(null);
    };

    // Lógica universal de guardar (descobre sozinho se é Criar ou Atualizar)
    const handleSalvar = async (dados) => {
        let sucesso = false;

        if (dados.id) {
            sucesso = await updateFunction(token, dados.id, dados);
        } else {
            sucesso = await addFunction(token, dados);
        }

        if (sucesso) {
            fecharModal();
            alert("Operação realizada com sucesso!");
        } else {
            alert("Ocorreu um erro ao guardar os dados.");
        }
    };

    return {
        modalAberto,
        itemEmEdicao,
        abrirParaCriar,
        abrirParaEditar,
        fecharModal,
        handleSalvar
    };
}